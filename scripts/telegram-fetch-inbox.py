#!/usr/bin/env python3
"""
Fetch new Telegram messages for business-implementation-planner.

Setup:
  1. Copy .env.example → .env and set TELEGRAM_BOT_TOKEN
  2. Install ffmpeg for video frame extraction: brew install ffmpeg
  3. Message your bot in Telegram (text, photos, or videos)
  4. Run: python3 scripts/telegram-fetch-inbox.py

Output:
  business-inbox/telegram-inbox.md
  business-inbox/images/   — photos + video key frames
  business-inbox/videos/   — raw video files (optional reference)
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INBOX_DIR = ROOT / "business-inbox"
IMAGES_DIR = INBOX_DIR / "images"
VIDEOS_DIR = INBOX_DIR / "videos"
OFFSET_FILE = INBOX_DIR / "telegram-offset.json"
INBOX_MD = INBOX_DIR / "telegram-inbox.md"
ENV_FILE = ROOT / ".env"
DEFAULT_MAX_FRAMES = 8


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    if not ENV_FILE.exists():
        return env
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def max_video_frames(env: dict[str, str]) -> int:
    raw = env.get("VIDEO_MAX_FRAMES") or os.environ.get("VIDEO_MAX_FRAMES") or ""
    try:
        n = int(raw)
        return max(3, min(n, 12))
    except ValueError:
        return DEFAULT_MAX_FRAMES


def has_ffmpeg() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def api_get(token: str, method: str, params: dict | None = None) -> dict:
    query = f"?{urllib.parse.urlencode(params)}" if params else ""
    url = f"https://api.telegram.org/bot{token}/{method}{query}"
    req = urllib.request.Request(url, headers={"User-Agent": "laocar-telegram-inbox/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if not data.get("ok"):
        raise RuntimeError(data.get("description", "Telegram API error"))
    return data["result"]


def download_file(token: str, file_id: str, dest: Path) -> None:
    meta = api_get(token, "getFile", {"file_id": file_id})
    file_path = meta["file_path"]
    url = f"https://api.telegram.org/file/bot{token}/{file_path}"
    dest.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, dest)


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\-]+", "-", text.lower()).strip("-")
    return text[:40] or "message"


def probe_duration(video_path: Path) -> float | None:
    try:
        out = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(video_path),
            ],
            capture_output=True,
            text=True,
            check=True,
            timeout=60,
        )
        return max(float(out.stdout.strip()), 0.1)
    except (subprocess.SubprocessError, ValueError):
        return None


def extract_video_frames(video_path: Path, msg_id: int, max_frames: int) -> list[Path]:
    """Extract evenly spaced JPEG frames for the planner agent to analyze."""
    if not has_ffmpeg():
        return []

    duration = probe_duration(video_path)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    frames: list[Path] = []

    if duration is None:
        timestamps = [0.0]
    else:
        if duration <= 1.0:
            timestamps = [0.0]
        else:
            count = min(max_frames, max(3, int(duration // 2) + 1))
            step = duration / count
            timestamps = [min(i * step, max(duration - 0.1, 0)) for i in range(count)]

    for i, ts in enumerate(timestamps, start=1):
        dest = IMAGES_DIR / f"{msg_id}-video-frame-{i:02d}.jpg"
        try:
            subprocess.run(
                [
                    "ffmpeg",
                    "-y",
                    "-ss",
                    f"{ts:.2f}",
                    "-i",
                    str(video_path),
                    "-frames:v",
                    "1",
                    "-q:v",
                    "2",
                    str(dest),
                ],
                capture_output=True,
                check=True,
                timeout=90,
            )
            if dest.exists() and dest.stat().st_size > 0:
                frames.append(dest)
        except subprocess.SubprocessError:
            continue

    return frames


def load_offset() -> int | None:
    if not OFFSET_FILE.exists():
        return None
    try:
        data = json.loads(OFFSET_FILE.read_text(encoding="utf-8"))
        return int(data.get("offset"))
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


def save_offset(offset: int) -> None:
    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    OFFSET_FILE.write_text(
        json.dumps({"offset": offset, "updated_at": datetime.now(timezone.utc).isoformat()}, indent=2),
        encoding="utf-8",
    )


def sender_label(message: dict) -> str:
    chat = message.get("chat", {})
    user = message.get("from", {})
    if chat.get("title"):
        return f"chat:{chat['title']}"
    parts = [user.get("first_name", ""), user.get("last_name", "")]
    name = " ".join(p for p in parts if p).strip() or "unknown"
    if user.get("username"):
        return f"@{user['username']} ({name})"
    return name


def video_extension(media: dict) -> str:
    mime = (media.get("mime_type") or "").lower()
    if "webm" in mime:
        return ".webm"
    if "quicktime" in mime or "mov" in mime:
        return ".mov"
    return ".mp4"


def append_video(
    token: str,
    lines: list[str],
    assets: list[str],
    msg_id: int,
    who: str,
    media: dict,
    kind: str,
    max_frames: int,
) -> None:
    file_id = media.get("file_id")
    if not file_id:
        return

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
    ext = video_extension(media)
    video_name = f"{msg_id}-{slugify(who)}-{kind}{ext}"
    video_rel = f"videos/{video_name}"
    video_path = INBOX_DIR / video_rel

    download_file(token, file_id, video_path)
    assets.append(video_rel)

    duration = media.get("duration")
    lines.append(f"**Video ({kind})** — `{video_rel}`" + (f", {duration}s" if duration else ""))
    lines.append("")

    frame_paths = extract_video_frames(video_path, msg_id, max_frames)
    if frame_paths:
        lines.append("Key frames (analyze these like screen recordings):")
        lines.append("")
        for frame in frame_paths:
            rel = f"images/{frame.name}"
            assets.append(rel)
            lines.append(f"![{kind} frame]({rel})")
        lines.append("")
    elif not has_ffmpeg():
        lines.append(
            "_Video saved but frames not extracted — install ffmpeg (`brew install ffmpeg`) and re-fetch._"
        )
        lines.append("")
    else:
        lines.append("_Video saved; frame extraction failed._")
        lines.append("")


def format_message(token: str, message: dict, index: int, max_frames: int) -> tuple[str, list[str]]:
    lines: list[str] = []
    assets: list[str] = []
    update_id = message.get("_update_id", "?")
    msg_id = message.get("message_id", index)
    ts = message.get("date")
    when = (
        datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        if ts
        else "unknown time"
    )
    who = sender_label(message)

    lines.append(f"## Message {msg_id} — {when} — {who}")
    lines.append("")

    text = message.get("text") or message.get("caption")
    if text:
        lines.append(text.strip())
        lines.append("")

    for entity in message.get("entities") or message.get("caption_entities") or []:
        if entity.get("type") == "url" and text:
            start, end = entity["offset"], entity["offset"] + entity["length"]
            lines.append(f"- Link: {text[start:end]}")

    photo_sizes = message.get("photo") or []
    if photo_sizes:
        best = max(photo_sizes, key=lambda p: p.get("file_size", 0))
        filename = f"{msg_id}-{slugify(who)}.jpg"
        rel = f"images/{filename}"
        download_file(token, best["file_id"], INBOX_DIR / rel)
        assets.append(rel)
        lines.append(f"![photo]({rel})")
        lines.append("")

    if message.get("video"):
        append_video(token, lines, assets, msg_id, who, message["video"], "video", max_frames)

    if message.get("video_note"):
        append_video(token, lines, assets, msg_id, who, message["video_note"], "video-note", max_frames)

    if message.get("animation"):
        append_video(token, lines, assets, msg_id, who, message["animation"], "animation", max_frames)

    doc = message.get("document")
    if doc:
        mime = (doc.get("mime_type") or "").lower()
        if mime.startswith("video/"):
            append_video(token, lines, assets, msg_id, who, doc, "document-video", max_frames)
        else:
            filename = doc.get("file_name") or f"{msg_id}-document"
            safe = re.sub(r"[^\w.\-]+", "_", filename)
            rel = f"images/{safe}"
            download_file(token, doc["file_id"], INBOX_DIR / rel)
            assets.append(rel)
            lines.append(f"- Attachment: `{rel}`")
            lines.append("")

    lines.append(f"_telegram update_id: {update_id}_")
    lines.append("")
    return "\n".join(lines), assets


def main() -> int:
    env = load_env()
    token = env.get("TELEGRAM_BOT_TOKEN") or os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        print("Missing TELEGRAM_BOT_TOKEN.", file=sys.stderr)
        print("Copy .env.example to .env and add your bot token from @BotFather.", file=sys.stderr)
        return 1

    frames_limit = max_video_frames(env)

    if "--status" in sys.argv:
        me = api_get(token, "getMe")
        webhook = api_get(token, "getWebhookInfo")
        updates = api_get(token, "getUpdates", {"limit": 5})
        offset = load_offset()
        username = me.get("username", "?")
        print(f"Bot: @{username} ({me.get('first_name', '')})")
        print("Webhook URL:", webhook.get("url") or "(none — polling OK)")
        print("ffmpeg:", "installed" if has_ffmpeg() else "NOT FOUND — videos won't produce frames")
        print("Video max frames:", frames_limit)
        print("Pending updates:", len(updates))
        for u in updates:
            m = u.get("message") or {}
            kind = "text"
            if m.get("video") or m.get("video_note"):
                kind = "video"
            elif m.get("photo"):
                kind = "photo"
            print(f"  - update {u['update_id']}: {kind} {m.get('text', m.get('caption', ''))!r}")
        print("Saved offset:", offset if offset is not None else "(none)")
        print("Send a message to @" + username + ", then run: python3 scripts/telegram-fetch-inbox.py")
        return 0

    if "--reset" in sys.argv:
        if OFFSET_FILE.exists():
            OFFSET_FILE.unlink()
            print("Cleared saved offset.")

    offset = load_offset()
    params: dict[str, int] = {"timeout": 0}
    if offset is not None:
        params["offset"] = offset

    try:
        updates = api_get(token, "getUpdates", params)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"Telegram API HTTP {exc.code}: {body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as exc:
        print(f"Network error: {exc}", file=sys.stderr)
        return 1

    if not updates:
        print("No new messages.")
        if INBOX_MD.exists():
            print(f"Inbox file: {INBOX_MD}")
        return 0

    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    blocks: list[str] = []
    all_assets: list[str] = []
    max_update_id = offset or 0

    for update in updates:
        update_id = update["update_id"]
        max_update_id = max(max_update_id, update_id)
        message = update.get("message") or update.get("edited_message")
        if not message:
            continue
        message["_update_id"] = update_id
        block, assets = format_message(token, message, update_id, frames_limit)
        blocks.append(block)
        all_assets.extend(assets)

    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    header = [
        "# Telegram business inbox",
        "",
        f"Fetched: {fetched_at}",
        f"New messages: {len(blocks)}",
        "",
        "Use with Cursor:",
        "`Use business-implementation-planner — read business-inbox/telegram-inbox.md, analyze all images and video key frames, then write the implementation todo list.`",
        "",
        "---",
        "",
    ]

    INBOX_MD.write_text("\n".join(header + blocks), encoding="utf-8")
    save_offset(max_update_id + 1)

    print(f"Fetched {len(blocks)} message(s) → {INBOX_MD}")
    if all_assets:
        print("Assets:", ", ".join(all_assets))
    if not has_ffmpeg():
        print("Tip: install ffmpeg for video frame extraction: brew install ffmpeg", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
