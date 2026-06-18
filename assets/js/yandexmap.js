(function () {
  if (typeof ymaps === 'undefined') return;

  ymaps.ready(init);

  function init() {
    var mapNode = document.getElementById('contactsYandexMap');
    if (!mapNode) return;

    var myMap = new ymaps.Map('contactsYandexMap', {
      center: [53.903855559766946, 27.562364839412634],
      zoom: 12
    });

    myMap.geoObjects.add(
      new ymaps.Placemark(
        [53.903855559766946, 27.562364839412634],
        {},
        {
          iconLayout: 'default#image',
          iconImageHref: '/assets/img/marker.png'
        }
      )
    );

    myMap.controls.remove('geolocationControl');
    myMap.controls.remove('searchControl');
    myMap.controls.remove('trafficControl');
    myMap.controls.remove('typeSelector');
    myMap.controls.remove('fullscreenControl');
    myMap.behaviors.disable('scrollZoom');
    myMap.controls.remove('rulerControl');
  }
})();
