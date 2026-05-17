      (function () {
        if (typeof ymaps === 'undefined') return;

        ymaps.ready(function initContactsMap() {
          var mapNode = document.getElementById('contactsYandexMap');
          if (!mapNode) return;

          var center = [53.903855559766946, 27.562364839412634];
          var myMap = new ymaps.Map('contactsYandexMap', {
            center: center,
            zoom: 12,
            controls: []
          });

          myMap.geoObjects.add(new ymaps.Placemark(center, {}, {
            iconLayout: 'default#image',
            iconImageHref: '/assets/img/marker.png',
            iconImageSize: [36, 48],
            iconImageOffset: [-18, -48]
          }));

          myMap.controls.remove('geolocationControl');
          myMap.controls.remove('searchControl');
          myMap.controls.remove('trafficControl');
          myMap.controls.remove('typeSelector');
          myMap.controls.remove('fullscreenControl');
          myMap.controls.remove('zoomControl');
          myMap.controls.remove('rulerControl');
          myMap.behaviors.disable('scrollZoom');
        });
      }());
    
