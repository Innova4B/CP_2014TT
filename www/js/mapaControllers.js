angular.module('starter.mapacontrollers', ['ngCordova'])

.controller('MapaCtrl', function($rootScope, $scope, $state, $stateParams, $ionicLoading, $location, $cordovaGeolocation, $cordovaNetwork, $translate, $ionicModal, $ionicSlideBoxDelegate, $ionicPlatform, $ionicPopup, Ruta, Poi, Restaurant, Pub, Accommodation, Event, Shop, ngDialog) {

  var item_id = $stateParams.id;
  var route_id = $stateParams.routeId;
  var current_state = $state.current.name;
  $scope.tipo = null;
  $scope.position = 'map';
  $scope.title = "";
  $scope.latitude = null;
  $scope.longitude = null;
  var infowindow = null;

  $scope.init = function() {

    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    //En funcion de current_state sabemos en que estado estamos
    switch(current_state) {
      case 'tab.mapaPoi':
        $scope.tipo = 'pois';

        Poi.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {

          $scope.title = poi.title;
          $scope.latitude = poi.latitude;
          $scope.longitude = poi.longitude;
          poi.photosApp.push(poi.mainImageApp);
          $scope.photos = groupPhotos(poi.photosApp,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {

            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() { 

                  var mapLatLng = new google.maps.LatLng(poi.latitude, poi.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  map = new google.maps.Map(document.getElementsByClassName("mapa-poi")[0], mapOptions);
                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pois/' + poi.id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + poi.name + '</div></a>';

                  attachInfo($scope, map, marker, content, item_id, poi.photosApp, poi.audioguide);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([poi.latitude, poi.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'location',
              prefix: 'ion',
              markerColor: 'cadetblue'
            });

            var marker = L.marker([poi.latitude, poi.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(poi.name, {closeButton: false});

            attachInfoOffline(marker, $scope, poi_id, poi.photosApp, poi.audioguide);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude;
              var myLongitude = position.coords.longitude;

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/pois/" + item_id);
          }

        });
        break;
      case 'tab.mapaRestaurant':
        $scope.tipo = 'restaurants';

        Restaurant.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {

          $scope.title = restaurant.title;
          $scope.latitude = restaurant.latitude;
          $scope.longitude = restaurant.longitude;
          restaurant.photosApp.push(restaurant.mainImageApp);
          $scope.photos = groupPhotos(restaurant.photosApp,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {

            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {

                  var mapLatLng = new google.maps.LatLng(restaurant.latitude, restaurant.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  var map = new google.maps.Map(document.getElementsByClassName("mapa-restaurant")[0], mapOptions);

                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/restaurants/' + restaurant.id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + restaurant.name + '</div></a>';

                  attachInfoRestaurant($scope, map, marker, content, item_id, restaurant.photosApp, restaurant.audioguide);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([restaurant.latitude, restaurant.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'android-restaurant',
              prefix: 'ion',
              markerColor: 'orange'
            });

            var marker = L.marker([restaurant.latitude, restaurant.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(restaurant.name, {closeButton: false});

            attachInfoOfflineRestaurant(marker, $scope, item_id, restaurant.photosApp, restaurant.audioguide);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/restaurants/" + item_id);
          }

        });
        break;
      case 'tab.mapaPub':
        $scope.tipo = 'pubs';

        Pub.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {

          $scope.title = pub.title;
          $scope.latitude = pub.latitude;
          $scope.longitude = pub.longitude;
          pub.photosApp.push(pub.mainImageApp);
          $scope.photos = groupPhotos(pub.photosApp,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {

            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {
                  var mapLatLng = new google.maps.LatLng(pub.latitude, pub.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  var map = new google.maps.Map(document.getElementsByClassName("mapa-pub")[0], mapOptions);

                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pubs/' + pub.id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + pub.name + '</div></a>';

                  attachInfoPub($scope, map, marker, content, item_id, pub.photosApp, pub.audioguide);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([pub.latitude, pub.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'android-bar',
              prefix: 'ion',
              markerColor: 'purple'
            });

            var marker = L.marker([pub.latitude, pub.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(pub.name, {closeButton: false});

            attachInfoOfflinePub(marker, $scope, item_id, pub.photosApp, pub.audioguide);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/pubs/" + item_id);
          }

        });
        break;
      case 'tab.mapaAccommodation':
        $scope.tipo = 'accommodations';

        Accommodation.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {

          $scope.title = accommodation.title;
          $scope.latitude = accommodation.latitude;
          $scope.longitude = accommodation.longitude;
          accommodation.photosApp.push(accommodation.mainImageApp);
          $scope.photos = groupPhotos(accommodation.photosApp,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {
            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {
                  var mapLatLng = new google.maps.LatLng(accommodation.latitude, accommodation.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  var map = new google.maps.Map(document.getElementsByClassName("mapa-accommodation")[0], mapOptions);

                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/accommodations/' + accommodation.id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + accommodation.name + '</div></a>';

                  attachInfoAccommodation($scope, map, marker, content, item_id, accommodation.photosApp, accommodation.audioguide);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([accommodation.latitude, accommodation.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'bed',
              prefix: 'fa',
              markerColor: 'red'
            });

            var marker = L.marker([accommodation.latitude, accommodation.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(accommodation.name, {closeButton: false});

            attachInfoOfflineAccommodation(marker, $scope, item_id, accommodation.photosApp, accommodation.audioguide);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/accommodations/" + item_id);
          }

        });
        break;
      case 'tab.mapaEvent':
        $scope.tipo = 'events';

        Event.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {

          $scope.title = event.title;
          $scope.latitude = event.latitude;
          $scope.longitude = event.longitude;

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {
            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {
                  var mapLatLng = new google.maps.LatLng(event.latitude, event.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  var map = new google.maps.Map(document.getElementsByClassName("mapa-event")[0], mapOptions);

                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/events/' + event.eventId + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + event.name + '</div></a>';

                  attachInfoEvent($scope, map, marker, content, item_id);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([event.latitude, event.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'ion-ios-book',
              prefix: 'ion',
              markerColor: 'green'
            });

            var marker = L.marker([event.latitude, event.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(event.name, {closeButton: false});

            attachInfoOfflineEvent(marker, $scope, item_id);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/events/" + item_id);
          }

        });
        break;
      case 'tab.mapaShop':
        $scope.tipo = 'shops';

        Shop.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {

          $scope.title = shop.title;
          $scope.latitude = shop.latitude;
          $scope.longitude = shop.longitude;
          shop.photosApp.push(shop.mainImageApp);
          $scope.photos = groupPhotos(shop.photosApp,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {
            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {
                  var mapLatLng = new google.maps.LatLng(shop.latitude, shop.longitude);
                  
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  var map = new google.maps.Map(document.getElementsByClassName("mapa-shop")[0], mapOptions);

                  $scope.map = map;

                  var marker = new MarkerWithLabel({
                    position: mapLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/shops/' + shop.id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + shop.name + '</div></a>';

                  attachInfoShop($scope, map, marker, content, item_id, shop.photosApp, shop.audioguide);

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });

          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([shop.latitude, shop.longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13}).addTo(map);

            var iconMarker = L.AwesomeMarkers.icon({
              icon: 'bag',
              prefix: 'ion',
              markerColor: 'blue'
            });

            var marker = L.marker([shop.latitude, shop.longitude], {icon: iconMarker});
            marker.addTo(map).bindPopup(shop.name, {closeButton: false});

            attachInfoOfflineShop(marker, $scope, item_id, shop.photosApp, shop.audioguide);

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/shops/" + item_id);
          }

        });
        break;
      case 'tab.mapaRuta':
        $scope.tipo = 'rutas';

        Ruta.getById(item_id, $scope.fileSystem ,$scope.appDirectory ,$scope.appLanguage).then(function(ruta) {

          var photos = [];
          for(var i=0; i<ruta.routePois.length; i++) {
            photos.push(ruta.routePois[i].photo);
          }
          $scope.photos = groupPhotos(photos,3);
          $ionicSlideBoxDelegate.update();

          //Si estamos online cargamos los mapas de Google
          if($cordovaNetwork.isOnline()) {
            google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() {
                  var mapLatLng = new google.maps.LatLng(ruta.routePois[0].latitude, ruta.routePois[0].longitude);
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 14,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };
           
                  var map = new google.maps.Map(document.getElementsByClassName("mapa-ruta")[0], mapOptions);
                  var bounds = new google.maps.LatLngBounds();

                  $scope.map = map;

                  for (var i = 0; i<=ruta.routePois.length - 1; i++) {
                    var routeLatLng = new google.maps.LatLng(ruta.routePois[i].latitude, ruta.routePois[i].longitude);
                    var marker = new google.maps.Marker({
                      position: routeLatLng,
                      map: map,
                      icon: "img/markers/number_" + (i+1) + ".png"
                    });

                    if(i>0) {
                      var line = new google.maps.Polyline({
                        path: [originLatLng, routeLatLng],
                        strokeColor: "#555555",
                        strokeOpacity: 0.5,
                        strokeWeight: 5,
                        map: map
                      });
                    }

                    var originLatLng = routeLatLng;

                    bounds.extend(routeLatLng);
                    map.fitBounds(bounds);
                    ruta.routePois[i].photosApp.push(ruta.routePois[i].mainImageApp);
                    if(ruta.routePois[i].type==1){
                      var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pois/' + ruta.routePois[i].id + '">' +
                          '<i class="icon ion-location pois"></i>' +
                          '<div class="iw_title">' + ruta.routePois[i].name + '</div></a>';
                      attachInfo($scope, map, marker, content, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
                    }
                    else if(ruta.routePois[i].type==2) {
                      var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/restaurants/' + ruta.routePois[i].id + '">' +
                          '<i class="icon ion-android-restaurant restaurants"></i>' +
                          '<div class="iw_title">' + ruta.routePois[i].name + '</div></a>';
                      attachInfoRestaurant($scope, map, marker, content, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
                    }
                    else if(ruta.routePois[i].type==3) {
                      var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pubs/' + ruta.routePois[i].id + '">' +
                          '<i class="icon ion-android-bar pubs"></i>' +
                          '<div class="iw_title">' + ruta.routePois[i].name + '</div></a>';
                      attachInfoPub($scope, map, marker, content, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
                    }
                    else if(ruta.routePois[i].type==4) {
                      var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/accommodations/' + ruta.routePois[i].id + '">' +
                        '<i class="icon fa fa-bed accommodations"></i>' +
                        '<div class="iw_title">' + ruta.routePois[i].name + '</div></a>';
                      attachInfoAccommodation($scope, map, marker, content, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
                    }
                    else if(ruta.routePois[i].type==5) {
                      var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/shops/' + ruta.routePois[i].id + '">' +
                          '<i class="icon ion-bag shops"></i>' +
                          '<div class="iw_title">' + ruta.routePois[i].name + '</div></a>';
                      attachInfoShop($scope, map, marker, content, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
                    }
                  }

                  //MY POSITION
                  var posOptions = {timeout: 10000, enableHighAccuracy: false};
                  
                  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                    var image = {
                      url: "img/markers/my-location-icon.png",
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25),
                      scaledSize: new google.maps.Size(50, 50)
                    };

                    var marker = new google.maps.Marker({
                      position: myLatLng,
                      map: map,
                      icon: image
                    });

                    var infowindow = new google.maps.InfoWindow({
                      content: $translate.instant("mapa.tuposicion")
                    });

                    google.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(map,marker);
                    });
                  });
                });
              }, 'other_params':'key=API_KEY'
            });

          // Si estamos offline cargamos los mapas locales
          } else if($scope.offline) {
            var map = L.map('map').setView([ruta.routePois[0].latitude, ruta.routePois[0].longitude], 14);

            L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
              {maxZoom: 16, minZoom: 13, maxBounds: bounds}).addTo(map);

            for (var i = 0; i<=ruta.routePois.length - 1; i++) {
              var routeLatLng = new L.latLng(ruta.routePois[i].latitude, ruta.routePois[i].longitude);
              var image = L.icon({
                iconUrl: "img/markers/number_" + (i+1) + ".png",
                popupAnchor:  [0, -40],
                iconAnchor:   [16, 37]
              });

              var marker = L.marker([ruta.routePois[i].latitude, ruta.routePois[i].longitude],{icon: image});
              marker.addTo(map).bindPopup(ruta.routePois[i].name, {closeButton: false});

              ruta.routePois[i].photosApp.push(ruta.routePois[i].mainImageApp);

              if(ruta.routePois[i].type==1){
                attachInfoOffline(marker, $scope, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
              }
              else if(ruta.routePois[i].type==2) {
                attachInfoOfflineRestaurant(marker, $scope, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
              }
              else if(ruta.routePois[i].type==3) {
                attachInfoOfflinePub(marker, $scope, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
              }
              else if(ruta.routePois[i].type==4) {
                attachInfoOfflineAccommodation(marker, $scope, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
              }
              else if(ruta.routePois[i].type==5) {
                attachInfoOfflineShop(marker, $scope, ruta.routePois[i].id, ruta.routePois[i].photosApp, ruta.routePois[i].audioguide);
              }

              if(i>0) {
                var pointList = [originLatLng, routeLatLng];
                console.log(pointList);
                var line = new L.polyline(pointList, {
                  color: "#555555",
                  opacity: 0.5,
                  weight: 5
                });
                line.addTo(map);
              }
              var originLatLng = routeLatLng;
            }

            //MY POSITION
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              var myLatitude  = position.coords.latitude
              var myLongitude = position.coords.longitude

              L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
              .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
              .openPopup();

            });
          } else {
            $scope.showConfirm("tab/rutas/" + item_id);
          }
        });
        break;
    }

    if($rootScope.pathMiViaje)
      $scope.backPath = "#/tab/miviaje";
    else
      $scope.backPath = '#/tab/' + $scope.tipo;
  }

  $scope.poiInfo = function () {
    $scope.tipo = $state.current.url.split('/')[1];
    $location.path("tab/" + $scope.tipo + "/" + item_id);
    $scope.closeDialog();
  };

  $scope.poiPuntos = function () {
    $location.path("tab/rutas/pois/" + item_id);
    $scope.closeDialog();
  };

  $scope.poiOpinion = function () {
    $scope.tipo = $state.current.url.split('/')[1];
    $location.path("tab/" + $scope.tipo + "/opiniones/" + item_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-map.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.poiMapa = function () {
    $location.path("tab/" + $scope.tipo + "/mapa/" + item_id);
  };

  $scope.isRoute = function () {
    if($scope.tipo=='rutas')
      return true;
    else
      return false;
  }

  $scope.openImage = function (index) {
    $scope.imageSrc = index;
    $scope.openModal();
  }

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.openGeo = function() {
        if(ionic.Platform.isIOS())
            window.open('http://maps.google.com/maps?ll=' + $scope.latitude + ',' + $scope.longitude, '_system');
        else
            window.open('geo:0,0?q=' + $scope.latitude + ',' + $scope.longitude, '_system');
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  function attachInfo(scope, map, marker, text, poi_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "pois";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pois', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOffline(marker, scope, poi_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "pois";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pois', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoRestaurant(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "restaurants";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'restaurants', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineRestaurant(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "restaurants";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'restaurants', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoPub(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "pubs";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pubs', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflinePub(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "pubs";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pubs', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoAccommodation(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "accommodations";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'accommodations', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineAccommodation(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "accommodations";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'accommodations', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoEvent(scope, map, marker, text, item_id) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(text);
      infowindow.open(map,marker);
    }); 
  }

  function attachInfoOfflineEvent(marker, scope, item_id) {
    marker.on('click', function() {
      
    });
  }

  function attachInfoShop(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "shops";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'shops', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineShop(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "shops";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'shops', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  $scope.showConfirm = function(path) {
    var confirmPopup = $ionicPopup.confirm({
      title: $translate.instant("offline.title"),
      template: '<p class="item item-text-wrap">' + $translate.instant("offline.message") + '</p>',
      buttons: [
        {
          text: '<b>' + $translate.instant("button.accept") + '</b>',
          type: 'button-custom',
          onTap: function(e) {
            $location.path(path);
          }
        }
      ]
    });
  };

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    if(states.stateName == "tab.mapaPoi" || states.stateName == "tab.mapaRuta" || states.stateName == "tab.mapaRestaurant" || states.stateName == "tab.mapaPub" || states.stateName == "tab.mapaAccommodation" || states.stateName == "tab.mapaShop" || states.stateName == "tab.mapaEvent") {
      $scope.init();
    }
  });

})

.controller('MapaCercanoCtrl', function($scope, $state, $stateParams, $ionicLoading, $location, $cordovaGeolocation, $cordovaNetwork, $translate, $ionicModal, $ionicSlideBoxDelegate, $ionicPlatform, $ionicPopup, Ruta, Poi, Restaurant, Pub, Accommodation, Event, Shop) {
  
  var map = null;
  var item_id = $stateParams.id;
  var current_state = $state.current.name;
  $scope.tipo = null;
  var infowindow = null;
  var myLatLng = null;
  var limitDistance = 5000;

  $scope.init = function() {
    ionic.DomUtil.ready(function(){

      $ionicModal.fromTemplateUrl('templates/image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });

      $scope.showConfirm = function(path) {
        var confirmPopup = $ionicPopup.confirm({
          title: $translate.instant("offline.title"),
          template: '<p class="item item-text-wrap">' + $translate.instant("offline.message") + '</p>',
          buttons: [
            {
              text: '<b>' + $translate.instant("button.accept") + '</b>',
              type: 'button-custom',
              onTap: function(e) {
                $location.path(path);
              }
            }
          ]
        });
      }

      if($cordovaNetwork.isOnline()) {

        google.load("maps", "3",{
          callback:function(){

            var head= document.getElementsByTagName('head')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.src= 'js/leaflet/markerwithlabel.js';
            head.appendChild(script);

            var mapLatLng = new google.maps.LatLng(0,0);
            var mapOptions = {
              center: mapLatLng,
              zoom: 13,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(document.getElementsByClassName("mapa-cercano")[0], mapOptions);
            $scope.map = map;

            //MY POSITION
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
              myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

              var image = {
                url: "img/markers/my-location-icon.png",
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(25, 25),
                scaledSize: new google.maps.Size(50, 50)
              };

              var marker = new google.maps.Marker({
                position: myLatLng,
                map: map,
                icon: image
              });

              map.setCenter(myLatLng);

            });

            var bounds = new google.maps.LatLngBounds();

            //POIS
            Poi.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pois){

              $scope.tipo = "pois";
              $scope.pois = pois.data;

              for(var i=0; i<pois.data.length; i++) {
                var itemLatLng = new google.maps.LatLng(pois.data[i].latitude, pois.data[i].longitude);
                bounds.extend(itemLatLng);
                map.fitBounds(bounds);
                  var marker = new MarkerWithLabel({
                    position: itemLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-location"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pois"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pois/' + pois.data[i].id + '">' +
                      '<i class="icon ion-location pois"></i>' +
                      '<div class="iw_title">' + pois.data[i].name + '</div></a>';

                  pois.data[i].photosApp.push(pois.data[i].mainImageApp);
                  attachInfo($scope, map, marker, content, pois.data[i].id, pois.data[i].photosApp, pois.data[i].audioguide);
                //}
              }
            })

            //RESTAURANTS
            Restaurant.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurants){
              $scope.tipo = "restaurants";
              $scope.restaurants = restaurants.data;

              for(var i=0; i<restaurants.data.length; i++) {
                var itemLatLng = new google.maps.LatLng(restaurants.data[i].latitude, restaurants.data[i].longitude);
                bounds.extend(itemLatLng);
                map.fitBounds(bounds);
                var marker = new MarkerWithLabel({
                  position: itemLatLng,
                  icon: ' ',
                  map: map,
                  labelContent: '<i class="icon ion-android-restaurant"></i>',
                  labelAnchor: new google.maps.Point(20, 25),
                  labelClass: "labels restaurants"
                });
                var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/restaurants/' + restaurants.data[i].id + '">' +
                    '<i class="icon ion-android-restaurant restaurants"></i>' +
                    '<div class="iw_title">' + restaurants.data[i].name + '</div></a>';
                restaurants.data[i].photosApp.push(restaurants.data[i].mainImageApp);
                attachInfoRestaurant($scope,map, marker, content, restaurants.data[i].id, restaurants.data[i].photosApp, restaurants.data[i].audioguide);

              }
            })

            //PUBS
            Pub.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pubs){
              $scope.tipo = "pubs";
              $scope.pubs = pubs.data;

              var image = {
                url: "img/maki-icons/bar-24@2x-dark.png",
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(18, 18),
                scaledSize: new google.maps.Size(36, 36)
              };

              for(var i=0; i<pubs.data.length; i++) {
                var itemLatLng = new google.maps.LatLng(pubs.data[i].latitude, pubs.data[i].longitude);
                bounds.extend(itemLatLng);
                map.fitBounds(bounds);
                
                  var marker = new MarkerWithLabel({
                    position: itemLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-android-bar"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels pubs"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pubs/' + pubs.data[i].id + '">' +
                      '<i class="icon ion-android-bar pubs"></i>' +
                      '<div class="iw_title">' + pubs.data[i].name + '</div></a>';
                  pubs.data[i].photosApp.push(pubs.data[i].mainImageApp);
                  attachInfoPub($scope,map, marker, content, pubs.data[i].id, pubs.data[i].photosApp, pubs.data[i].audioguide);

              }
            })

            //ACCOMMODATIONS
            Accommodation.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodations){
              $scope.tipo = "accommodations";
              $scope.accommodations = accommodations.data;

              var image = {
                url: "img/maki-icons/bar-24@2x-dark.png",
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(18, 18),
                scaledSize: new google.maps.Size(36, 36)
              };

              for(var i=0; i<accommodations.data.length; i++) {
                var itemLatLng = new google.maps.LatLng(accommodations.data[i].latitude, accommodations.data[i].longitude);
                bounds.extend(itemLatLng);
                map.fitBounds(bounds);
                
                  var marker = new MarkerWithLabel({
                    position: itemLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="fa fa-bed"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels accommodations"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/accommodations/' + accommodations.data[i].id + '">' +
                      '<i class="icon fa fa-bed accommodations"></i>' +
                      '<div class="iw_title">' + accommodations.data[i].name + '</div></a>';
                  accommodations.data[i].photosApp.push(accommodations.data[i].mainImageApp);
                  attachInfoAccommodation($scope,map, marker, content, accommodations.data[i].id, accommodations.data[i].photosApp, accommodations.data[i].audioguide);
                
              }
            })

            //SHOPS
            Shop.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shops){
              $scope.tipo = "shops";
              $scope.shops = shops.data;

              var image = {
                url: "img/maki-icons/bar-24@2x-dark.png",
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(18, 18),
                scaledSize: new google.maps.Size(36, 36)
              };

              for(var i=0; i<shops.data.length; i++) {
                var itemLatLng = new google.maps.LatLng(shops.data[i].latitude, shops.data[i].longitude);
                bounds.extend(itemLatLng);
                map.fitBounds(bounds);
                
                  var marker = new MarkerWithLabel({
                    position: itemLatLng,
                    icon: ' ',
                    map: map,
                    labelContent: '<i class="icon ion-bag"></i>',
                    labelAnchor: new google.maps.Point(20, 25),
                    labelClass: "labels shops"
                  });
                  var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/shops/' + shops.data[i].id + '">' +
                      '<i class="icon ion-bag shops"></i>' +
                      '<div class="iw_title">' + shops.data[i].name + '</div></a>';
                  shops.data[i].photosApp.push(shops.data[i].mainImageApp);
                  attachInfoShop($scope,map, marker, content, shops.data[i].id, shops.data[i].photosApp, shops.data[i].audioguide);
                
              }
            })
          }, 'other_params':'key=API_KEY'
          });

      } else if($scope.offline) {
        map = L.map(document.getElementsByClassName("mapa-cercano")[0]).setView([43.307646, -2.001380], 13);
        L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
          {maxZoom: 16, minZoom: 13}).addTo(map);

        //MY POSITION
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          var myLatitude  = position.coords.latitude;
          var myLongitude = position.coords.longitude;

          L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
          .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
          .openPopup();

          map.panTo(new L.LatLng(myLatitude, myLongitude));
        });

        //POIS
        Poi.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pois){
          $scope.tipo = "pois";
          $scope.pois = pois.data;

          for(var i=0; i<pois.data.length; i++) {
            var itemLatLng = new L.LatLng(pois.data[i].latitude, pois.data[i].longitude);
            
              var iconMarker = L.AwesomeMarkers.icon({
                icon: 'location',
                prefix: 'ion',
                markerColor: 'cadetblue'
              });
              var marker = L.marker([pois.data[i].latitude, pois.data[i].longitude], {icon: iconMarker});
              marker.addTo(map).bindPopup(pois.data[i].name, {closeButton: false});
              pois.data[i].photosApp.push(pois.data[i].mainImageApp);
              attachInfoOffline(marker, $scope, pois.data[i].id, pois.data[i].photosApp, pois.data[i].audioguide);
            
          }
        })

        //RESTAURANTS
        Restaurant.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurants){
          $scope.tipo = "restaurants";
          $scope.restaurants = restaurants.data;

          for(var i=0; i<restaurants.data.length; i++) {
            var itemLatLng = new L.LatLng(restaurants.data[i].latitude, restaurants.data[i].longitude);
            
              var iconMarker = L.AwesomeMarkers.icon({
                icon: 'android-restaurant',
                prefix: 'ion',
                markerColor: 'orange'
              });
              var marker = L.marker([restaurants.data[i].latitude, restaurants.data[i].longitude], {icon: iconMarker});
              marker.addTo(map).bindPopup(restaurants.data[i].name, {closeButton: false});
              restaurants.data[i].photosApp.push(restaurants.data[i].mainImageApp);
              attachInfoOfflineRestaurant(marker, $scope, restaurants.data[i].id, restaurants.data[i].photosApp, restaurants.data[i].audioguide);
            
          }
        })

        //PUBS
        Pub.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pubs){
          $scope.tipo = "pubs";
          $scope.pubs = pubs.data;

          for(var i=0; i<pubs.data.length; i++) {
            var itemLatLng = new L.LatLng(pubs.data[i].latitude, pubs.data[i].longitude);
            
              var iconMarker = L.AwesomeMarkers.icon({
                icon: 'android-bar',
                prefix: 'ion',
                markerColor: 'purple'
              });
              var marker = L.marker([pubs.data[i].latitude, pubs.data[i].longitude], {icon: iconMarker});
              marker.addTo(map).bindPopup(pubs.data[i].name, {closeButton: false});
              pubs.data[i].photosApp.push(pubs.data[i].mainImageApp);
              attachInfoOfflinePub(marker, $scope, pubs.data[i].id, pubs.data[i].photosApp, pubs.data[i].audios);
            
          }
        })

        //ACCOMMODATIONS
        Accommodation.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodations){
          $scope.tipo = "accommodations";
          $scope.accommodations = accommodations.data;

          for(var i=0; i<accommodations.data.length; i++) {
            var itemLatLng = new L.LatLng(accommodations.data[i].latitude, accommodations.data[i].longitude);
            
              var iconMarker = L.AwesomeMarkers.icon({
                icon: 'bed',
                prefix: 'fa',
                markerColor: 'red'
              });
              var marker = L.marker([accommodations.data[i].latitude, accommodations.data[i].longitude], {icon: iconMarker});
              marker.addTo(map).bindPopup(accommodations.data[i].name, {closeButton: false});
              accommodations.data[i].photosApp.push(accommodations.data[i].mainImageApp);
              attachInfoOfflineAccommodation(marker, $scope, accommodations.data[i].id, accommodations.data[i].photosApp, accommodations.data[i].audioguide);
            
          }
        })

        //SHOPS
        Shop.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shops){
          $scope.tipo = "shops";
          $scope.shops = shops.data;

          for(var i=0; i<shops.data.length; i++) {
            var itemLatLng = new L.LatLng(shops.data[i].latitude, shops.data[i].longitude);
            
              var iconMarker = L.AwesomeMarkers.icon({
                icon: 'bag',
                prefix: 'ion',
                markerColor: 'blue'
              });
              var marker = L.marker([shops.data[i].latitude, shops.data[i].longitude], {icon: iconMarker});
              marker.addTo(map).bindPopup(shops.data[i].name, {closeButton: false});
              shops.data[i].photosApp.push(shops.data[i].mainImageApp);
              attachInfoOfflineShop(marker, $scope, shops.data[i].id, shops.data[i].photosApp, shops.data[i].audioguide);
            
          }
        })

      } else {
        $scope.showConfirm("tab/guia");
      }
    });
  }

  $scope.openImage = function (index) {
    $scope.imageSrc = index;
    $scope.openModal();
  }

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  function attachInfo(scope, map, marker, text, poi_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "pois";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pois', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOffline(marker, scope, poi_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "pois";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pois', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoRestaurant(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "restaurants";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'restaurants', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineRestaurant(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "restaurants";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'restaurants', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoPub(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "pubs";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pubs', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflinePub(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "pubs";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'pubs', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoAccommodation(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "accommodations";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'accommodations', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineAccommodation(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "accommodations";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'accommodations', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  function attachInfoEvent(scope, map, marker, text, item_id) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(text);
      infowindow.open(map,marker);
      
    }); 
  }

  function attachInfoOfflineEvent(marker, scope, item_id) {
    marker.on('click', function() {
      
    });
  }

  function attachInfoShop(scope, map, marker, text, item_id, photos, audios) {
    if (infowindow) {
        infowindow.close();
    }
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      $scope.tipoPoi = "shops";
      infowindow.setContent(text);
      infowindow.open(map,marker);
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'shops', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    }); 
  }

  function attachInfoOfflineShop(marker, scope, item_id, photos, audios) {
    marker.on('click', function() {
      $scope.tipoPoi = "shops";
      var poiPhotos = [];
      poiPhotos = groupPhotos(photos,3);
      scope.photos = poiPhotos;
      $ionicSlideBoxDelegate.update();
      var tracks = getTracks(scope.fileSystem, scope.appDirectory, scope.appLanguage, 'shops', audios);
      $scope.tracks = tracks;
      if(tracks.length>0)
        $scope.hasAudio = true;
      else
        $scope.hasAudio = false;
    });
  }

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    if(states.stateName == "tab.mapa") {
      $scope.init();
    }
  });

})