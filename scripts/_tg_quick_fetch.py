#!/usr/bin/env python3
"""Quick one-shot Telegram fetcher using curl subprocess (avoids urllib hang)."""
import json, os, subprocess, sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / "business-inbox"
IMAGES = INBOX / "images"
VIDEOS = INBOX / "videos"

def load_token():
    env = ROOT / ".env"
    for line in env.read_text().splitlines():
        if line.startswith("TELEGRAM_BOT_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"\'')
    return os.environ.get("TELEGRAM_BOT_TOKEN", "")

def curl_get(url):
    r = subprocess.run(["curl", "-s", "--max-time", "20", url], capture_output=True)
    return json.loads(r.stdout)

def download(url, dest):
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["curl", "-s", "--max-time", "120", "-o", str(dest), url], check=True)

def main():
    token = load_token()
    base = f"https://api.telegram.org/bot{token}"

    data = curl_get(f"{base}/getUpdates?timeout=0&limit=20")
    updates = data.get("result", [])
    if not updates:
        print("No messages found.")
        return

    INBOX.mkdir(exist_ok=True)
    IMAGES.mkdir(exist_ok=True)
    VIDEOS.mkdir(exist_ok=True)

    lines = ["# Telegram business inbox\n"]
    for u in updates:
        m = u.get("message", {})
        msg_id = m.get("message_id", u["update_id"])
        text = m.get("text") or m.get("caption") or ""
        lines.append(f"## Message {msg_id}")
        if text:
            lines.append(text)
            lines.append("")

        # Best photo
        photos = m.get("photo", [])
        if photos:
            best = max(photos, key=lambda p: p.get("file_size", 0))
            fmeta = curl_get(f"{base}/getFile?file_id={best['file_id']}")
            fpath = fmeta["result"]["file_path"]
            ext = Path(fpath).suffix or ".jpg"
            dest = IMAGES / f"{msg_id}-photo{ext}"
            download(f"https://api.telegram.org/file/bot{token}/{fpath}", dest)
            lines.append(f"![photo](images/{dest.name})")
            lines.append("")

        # Video
        video = m.get("video") or m.get("video_note")
        if video:
            fmeta = curl_get(f"{base}/getFile?file_id={video['file_id']}")
            fpath = fmeta["result"]["file_path"]
            ext = Path(fpath).suffix or ".mp4"
            dest = VIDEOS / f"{msg_id}-video{ext}"
            download(f"https://api.telegram.org/file/bot{token}/{fpath}", dest)
            lines.append(f"**Video:** `videos/{dest.name}`")
            lines.append("")
            # Extract frames if ffmpeg available
            import shutil
            if shutil.which("ffmpeg"):
                dur_out = subprocess.run(
                    ["ffprobe","-v","error","-show_entries","format=duration",
                     "-of","default=noprint_wrappers=1:nokey=1", str(dest)],
                    capture_output=True, text=True
                )
                try:
                    dur = float(dur_out.stdout.strip())
                except:
                    dur = 10.0
                count = min(8, max(3, int(dur / 2)))
                for i in range(count):
                    ts = (i * dur / count)
                    frame = IMAGES / f"{msg_id}-video-frame-{i+1:02d}.jpg"
                    subprocess.run(
                        ["ffmpeg","-y","-ss",f"{ts:.1f}","-i",str(dest),
                         "-frames:v","1","-q:v","2",str(frame)],
                        capture_output=True
                    )
                    if frame.exists():
                        lines.append(f"![frame {i+1}](images/{frame.name})")
                lines.append("")
            else:
                lines.append("_ffmpeg not installed — no frames extracted_\n")

        lines.append(f"*update_id: {u['update_id']}*\n")

    out = INBOX / "telegram-inbox.md"
    out.write_text("\n".join(lines))
    # Save offset
    max_id = max(u["update_id"] for u in updates)
    (INBOX / "telegram-offset.json").write_text(json.dumps({"offset": max_id + 1}))
    print(f"Saved {len(updates)} messages → {out}")
    print("Assets in:", IMAGES, VIDEOS)

if __name__ == "__main__":
    main()
