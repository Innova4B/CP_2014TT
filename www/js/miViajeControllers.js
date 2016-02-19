angular.module('starter.miviajecontrollers', ['ngCordova'])

.controller('FavoriteCtrl', function($scope, $http, $stateParams, $state, itemsConfig, Favorite) {
  var item_id = $stateParams.id;

  $scope.tipo = null;
  $scope.itemType = null;
  
  var current_state = $state.current.name;

  //En funcion de current_state sabemos en que estado estamos
  switch(current_state) {
    case 'tab.poi':
      $scope.tipo = "pois";
      $scope.itemType = itemsConfig.poiType;
      break;
    case 'tab.restaurant':
      $scope.tipo = "restaurants";
      $scope.itemType = itemsConfig.restaurantType;
      break;
    case 'tab.pub':
      $scope.tipo = "pubs";
      $scope.itemType = itemsConfig.pubType;
      break;
    case 'tab.accommodation':
      $scope.tipo = "accommodations";
      $scope.itemType = itemsConfig.accommodationType;
      break;
    case 'tab.shop':
      $scope.tipo = "shops";
      $scope.itemType = itemsConfig.shopType;
      break;
    case 'tab.ruta':
      $scope.tipo = "rutas";
      $scope.itemType = itemsConfig.routeType;
      break;
    case 'tab.event':
      $scope.tipo = "events";
      $scope.itemType = itemsConfig.eventType;
      break;
  }

  Favorite.getFavorite($scope.itemType,item_id).then(function(result) {
    $scope.isFavorite = result.length;
    $scope.isVisited = false;

    if($scope.isFavorite)
      $scope.isVisited = result[0].visited;
  });
  
  $scope.favorito = function (type) {
    if($scope.isFavorite) {
      if($scope.isVisited) {
        if(type==itemsConfig.routeType)
          $scope.visitedRoutes.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
        else if (type==itemsConfig.eventType)
          $scope.visitedEvents.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
        else
          $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
      }

      Favorite.removeFavorite(type,item_id).then(function(result) {
        $scope.isFavorite = !result;
        $scope.isVisited = false;
      });
    } else {
      Favorite.addFavorite(type,item_id).then(function(result) {
        $scope.isFavorite = result;
      });
    }
  }

  $scope.visitado = function (type) {
    Favorite.addFavorite(type,item_id,!$scope.isVisited).then(function(result) {
      $scope.isFavorite = true;
      $scope.isVisited = !$scope.isVisited;

      if($scope.isVisited) {
        if(type==itemsConfig.routeType)
          $scope.visitedRoutes.push(parseInt(item_id));
        else if (type==itemsConfig.eventType)
          $scope.visitedEvents.push(parseInt(item_id));
        else
          $scope.visitedPois.push(parseInt(item_id));
      } else {
        if(type==itemsConfig.routeType)
          $scope.visitedRoutes.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
        else if (type==itemsConfig.eventType)
          $scope.visitedEvents.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
        else
          $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(item_id)), 1);
      }
    });
  }

})

.controller('MiViajeCtrl', function($rootScope, $scope, $http, $state, $cordovaGeolocation, $translate, $location, $ionicActionSheet, $ionicPopup, $ionicSideMenuDelegate, itemsConfig, Poi, Ruta, Restaurant, Pub, Accommodation, Event, Shop, Favorite) {

  $rootScope.pathMiViaje = true;
  $scope.filtroTipo = [];

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Todos"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("PuntosDeInteres"), 'value': itemsConfig.poiType});
    $scope.filtroTipo.push({'text': $translate.instant("Rutas"), 'value': itemsConfig.routeType});
    $scope.filtroTipo.push({'text': $translate.instant("Restaurantes"), 'value': itemsConfig.restaurantType});
    $scope.filtroTipo.push({'text': $translate.instant("Bares"), 'value': itemsConfig.pubType});
    $scope.filtroTipo.push({'text': $translate.instant("Alojamiento"), 'value': itemsConfig.accommodationType});
    $scope.filtroTipo.push({'text': $translate.instant("Agenda"), 'value': itemsConfig.eventType});
    $scope.filtroTipo.push({'text': $translate.instant("Tiendas"), 'value': itemsConfig.shopType});

  };

  $scope.visited = false;

  var current_state = $state.current.name;

  switch(current_state) {
    case 'tab.miviaje':
      $scope.visited = false;
      break;
    case 'tab.miviajevisitados':
      $scope.visited = true;
      break;
  }

  //MY POSITION
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  $scope.filtro = $scope.selectedValue.value;
  $scope.title = $translate.instant("Mi viaje");

  $scope.miViajeFiltro = function (type) {
    $scope.filtro = type;

    var myLatitude  = null;
    var myLongitude = null;

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      myLatitude  = position.coords.latitude;
      myLongitude = position.coords.longitude;
    })

    var items = [];
    var routes = [];
    var events = [];

    if(type) {
      if(type==itemsConfig.poiType)
        $scope.title = $translate.instant("PuntosInteres");
      else if(type==itemsConfig.restaurantType)
        $scope.title = $translate.instant("Restaurantes");
      else if(type==itemsConfig.pubType)
        $scope.title = $translate.instant("Bares");
      else if(type==itemsConfig.accommodationType)
        $scope.title = $translate.instant("Alojamiento");
      else if(type==itemsConfig.shopType)
        $scope.title = $translate.instant("Tiendas");
      else if(type==itemsConfig.eventType)
        $scope.title = $translate.instant("Eventos");
      else if(type==itemsConfig.routeType)
        $scope.title = $translate.instant("Rutas");

      Favorite.getAllByType(type, $scope.visited).then(function(favorites){
        for (var i = 0; i < favorites.length; i++) {

          switch(true) {
            case type==itemsConfig.poiType:
              Poi.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
                poi.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, poi.latitude, poi.longitude);
                if (poi.distance < 1)
                  poi.distance = (poi.distance*1000).toFixed(0) + ' m';
                else
                  poi.distance = poi.distance.toFixed(0) + ' km';
                poi.tipo = $translate.instant("PuntoInteres");
                poi.path = "pois";
                if($scope.visitedPois.indexOf(poi.id) > -1) {
                  poi.visited = true;
                } else {
                  poi.visited = false;
                }
                items.push(poi);
              });
              break;
            case type==itemsConfig.restaurantType:
              Restaurant.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
                restaurant.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, restaurant.latitude, restaurant.longitude);
                if (restaurant.distance < 1)
                  restaurant.distance = (restaurant.distance*1000).toFixed(0) + ' m';
                else
                  restaurant.distance = restaurant.distance.toFixed(0) + ' km';
                restaurant.tipo = $translate.instant("Restaurantes");
                restaurant.path = "restaurants";
                if($scope.visitedPois.indexOf(restaurant.id) > -1) {
                  restaurant.visited = true;
                } else {
                  restaurant.visited = false;
                }
                items.push(restaurant);
              });
              break;
            case type==itemsConfig.pubType:
              Pub.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
                pub.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, pub.latitude, pub.longitude);
                if (pub.distance < 1)
                  pub.distance = (pub.distance*1000).toFixed(0) + ' m';
                else
                  pub.distance = pub.distance.toFixed(0) + ' km';
                pub.tipo = $translate.instant("Bares");
                pub.path = "pubs";
                if($scope.visitedPois.indexOf(pub.id) > -1) {
                  pub.visited = true;
                } else {
                  pub.visited = false;
                }
                items.push(pub);
              });
              break;
            case type==itemsConfig.accommodationType:
              Accommodation.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
                accommodation.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, accommodation.latitude, accommodation.longitude);
                if (accommodation.distance < 1)
                  accommodation.distance = (accommodation.distance*1000).toFixed(0) + ' m';
                else
                  accommodation.distance = accommodation.distance.toFixed(0) + ' km';
                accommodation.tipo = $translate.instant("Alojamiento");
                accommodation.path = "accommodations";
                if($scope.visitedPois.indexOf(accommodation.id) > -1) {
                  accommodation.visited = true;
                } else {
                  accommodation.visited = false;
                }
                items.push(accommodation);
              });
              break;
            case type==itemsConfig.shopType:
              Shop.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
                shop.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, shop.latitude, shop.longitude);
                if (shop.distance < 1)
                  shop.distance = (shop.distance*1000).toFixed(0) + ' m';
                else
                  shop.distance = shop.distance.toFixed(0) + ' km';
                shop.tipo = $translate.instant("Tiendas");
                shop.path = "shops";
                if($scope.visitedPois.indexOf(shop.id) > -1) {
                  shop.visited = true;
                } else {
                  shop.visited = false;
                }
                items.push(shop);
              });
              break;
            case type==itemsConfig.eventType:
              Event.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {
                if(event.latitude && event.longitude){
                  event.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, event.latitude, event.longitude);
                  if (event.distance < 1)
                    event.distance = (event.distance*1000).toFixed(0) + ' m';
                  else
                    event.distance = event.distance.toFixed(0) + ' km';
                }
                event.tipo = $translate.instant("Eventos");
                event.path = "shops";
                if($scope.visitedEvents.indexOf(event.eventId) > -1) {
                  event.visited = true;
                } else {
                  event.visited = false;
                }
                var dateStart = new Date(event.dateStart);
                event.dayStart = dateStart.getDate();
                event.monthStart = $translate.instant("mes." + (dateStart.getMonth()+1));
                var dateEnd = new Date(event.dateStart);
                event.dayEnd = dateEnd.getDate();
                event.monthEnd = $translate.instant("mes." + (dateStart.getMonth()+1));
                events.push(event);
              });
              break;
            case type==itemsConfig.routeType:
              Ruta.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(ruta) {
                ruta.tipo = $translate.instant("Ruta");
                ruta.path = "rutas";
                if($scope.visitedRoutes.indexOf(ruta.routeId) > -1)
                  ruta.visited = true;
                else
                  ruta.visited = false;
                routes.push(ruta);
              });
              break;
          }
        }
        $scope.items = items;
        $scope.routes = routes;
        $scope.events = events;
      });
    } else {
      $scope.title = $translate.instant("tab.miviaje");
      $scope.loadAllItems();
    }
  }

  $scope.loadAllItems = function() {
    var items = [];
    var routes = [];
    var events = [];

    var myLatitude  = null;
    var myLongitude = null;

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      myLatitude  = position.coords.latitude;
      myLongitude = position.coords.longitude;
    })

    Favorite.getAllByType(itemsConfig.poiType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Poi.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
          poi.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, poi.latitude, poi.longitude);
          if (poi.distance < 1)
            poi.distance = (poi.distance*1000).toFixed(0) + ' m';
          else
            poi.distance = poi.distance.toFixed(0) + ' km';
          poi.tipo = $translate.instant("PuntoInteres");
          poi.path = "pois";
          if($scope.visitedPois.indexOf(poi.id) > -1)
            poi.visited = true;
          else
            poi.visited = false;
          items.push(poi);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.restaurantType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Restaurant.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
          restaurant.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, restaurant.latitude, restaurant.longitude);
          if (restaurant.distance < 1)
            restaurant.distance = (restaurant.distance*1000).toFixed(0) + ' m';
          else
            restaurant.distance = restaurant.distance.toFixed(0) + ' km';
          restaurant.tipo = $translate.instant("Restaurantes");
          restaurant.path = "restaurants";
          if($scope.visitedPois.indexOf(restaurant.id) > -1)
            restaurant.visited = true;
          else
            restaurant.visited = false;
          items.push(restaurant);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.pubType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Pub.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
          pub.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, pub.latitude, pub.longitude);
          if (pub.distance < 1)
            pub.distance = (pub.distance*1000).toFixed(0) + ' m';
          else
            pub.distance = pub.distance.toFixed(0) + ' km';
          pub.tipo = $translate.instant("Bares");
          pub.path = "pubs";
          if($scope.visitedPois.indexOf(pub.id) > -1)
            pub.visited = true;
          else
            pub.visited = false;
          items.push(pub);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.accommodationType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Accommodation.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
          accommodation.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, accommodation.latitude, accommodation.longitude);
          if (accommodation.distance < 1)
            accommodation.distance = (accommodation.distance*1000).toFixed(0) + ' m';
          else
            accommodation.distance = accommodation.distance.toFixed(0) + ' km';
          accommodation.tipo = $translate.instant("Alojamiento");
          accommodation.path = "accommodations";
          if($scope.visitedPois.indexOf(accommodation.id) > -1)
            accommodation.visited = true;
          else
            accommodation.visited = false;
          items.push(accommodation);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.shopType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Shop.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
          shop.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, shop.latitude, shop.longitude);
          if (shop.distance < 1)
            shop.distance = (shop.distance*1000).toFixed(0) + ' m';
          else
            shop.distance = shop.distance.toFixed(0) + ' km';
          shop.tipo = $translate.instant("Tiendas");
          shop.path = "shops";
          if($scope.visitedPois.indexOf(shop.id) > -1)
            shop.visited = true;
          else
            shop.visited = false;
          items.push(shop);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.eventType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Event.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {
          if(event.latitude && event.longitude){
            event.distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, event.latitude, event.longitude);
            if (event.distance < 1)
              event.distance = (event.distance*1000).toFixed(0) + ' m';
            else
              event.distance = event.distance.toFixed(0) + ' km';
          }
          event.tipo = $translate.instant("Eventos");
          event.path = "events";
          if($scope.visitedEvents.indexOf(event.eventId) > -1)
            event.visited = true;
          else
            event.visited = false;
          var dateStart = new Date(event.dateStart);
          event.dayStart = dateStart.getDate();
          event.monthStart = $translate.instant("mes." + (dateStart.getMonth()+1));
          var dateEnd = new Date(event.dateStart);
          event.dayEnd = dateEnd.getDate();
          event.monthEnd = $translate.instant("mes." + (dateStart.getMonth()+1));
          events.push(event);
        });
      }
    });

    Favorite.getAllByType(itemsConfig.routeType, $scope.visited).then(function(favorites){
      for (var i = 0; i < favorites.length; i++) {
        Ruta.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(ruta) {
          ruta.tipo = $translate.instant("Ruta");
          ruta.path = "rutas";
          if($scope.visitedRoutes.indexOf(ruta.routeId) > -1)
            ruta.visited = true;
          else
            ruta.visited = false;
          routes.push(ruta);
        });
      }
    });
    $scope.items = items;
    $scope.routes = routes;
    $scope.events = events;
  }

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    if(states.stateName == "tab.miviaje" || states.stateName == "tab.miviajevisitados") {
      $scope.miViajeFiltro($scope.filtro);
    }
    $rootScope.pathMiViaje = true;
  });

  $scope.miViajeFavoritos = function () {
    $scope.miViajeFiltro($scope.filtro);
    $location.path("tab/miviaje");
  };

  $scope.miViajeVisitados = function () {
    $scope.miViajeFiltro($scope.filtro);
    $location.path("tab/miviaje/visitados");
  };

  $scope.miViajeMapa = function () {
    $location.path("tab/miviaje/mapa");
  };
  $scope.onHold = function () {
    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: $translate.instant("miviaje.export") }
        ],
        cssClass: "options-sheet",
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.poiType,poi.id);
              } else {
                Favorite.addFavorite(itemsConfig.poiType,poi.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/pois/comentar/" + poi.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.poiType,poi.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(poi.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.poiType,poi.id,true);
                $scope.visitedPois.push(parseInt(poi.id));
              }
              break;
          }
          return true;
        }
      });
  }

  $scope.miViajeFiltroDialog = function() {
    $scope.buildFilter();
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroMiviaje.html',
      scope: $scope
    });

    $scope.selectType = function() {
      $scope.miViajeFiltro($scope.selectedValue.value);
      alertPopup.close();
    }

  };

  $scope.toggleSidebar = function() {
    $ionicSideMenuDelegate.toggleLeft($scope);
  };

})

.controller('MiViajeMapaCtrl', function($scope, $http, $state, $stateParams, $ionicLoading, $cordovaGeolocation, $translate, $location, $cordovaNetwork, $ionicModal, $ionicSlideBoxDelegate, $ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, itemsConfig, Poi, Ruta, Restaurant, Pub, Accommodation, Shop, Event, Favorite) {
  
  $scope.filtroTipo = [];

  $scope.selectedValue = {value: 0};

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Todos"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("PuntosDeInteres"), 'value': itemsConfig.poiType});
    $scope.filtroTipo.push({'text': $translate.instant("Rutas"), 'value': itemsConfig.routeType});
    $scope.filtroTipo.push({'text': $translate.instant("Restaurantes"), 'value': itemsConfig.restaurantType});
    $scope.filtroTipo.push({'text': $translate.instant("Bares"), 'value': itemsConfig.pubType});
    $scope.filtroTipo.push({'text': $translate.instant("Alojamiento"), 'value': itemsConfig.accommodationType});
    $scope.filtroTipo.push({'text': $translate.instant("Agenda"), 'value': itemsConfig.eventType});
    $scope.filtroTipo.push({'text': $translate.instant("Tiendas"), 'value': itemsConfig.shopType});

  };
  
  var map = null;
  var item_id = $stateParams.id;
  var current_state = $state.current.name;
  $scope.tipo = null;
  var infowindow = null;
      
  $scope.initialize = function() {
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

      //Si estamos online cargamos los mapas de Google
      if($cordovaNetwork.isOnline()) {
        google.load("maps", "3",{
              callback:function(){

                loadJS('js/leaflet/markerwithlabel.js', function() { 

                  var mapLatLng = new google.maps.LatLng(43,-1.35);
                  var mapOptions = {
                    center: mapLatLng,
                    zoom: 14,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

                  map = new google.maps.Map(document.getElementsByClassName("mapa-miviaje")[0], mapOptions);
                
                  $scope.map = map;
                  var bounds = new google.maps.LatLngBounds();

                  //POIS
                  Favorite.getAllByType(itemsConfig.poiType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Poi.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
                        var routeLatLng = new google.maps.LatLng(poi.latitude, poi.longitude);
                        //Si esta visitado icono con numero
                        var visitedIndex = $scope.visitedPois.indexOf(poi.id);
                        if(visitedIndex > -1) {
                          iconPath = "img/markers/number_" + (visitedIndex + 1) + ".png";
                          var marker = new google.maps.Marker({
                            position: routeLatLng,
                            map: map,
                            icon: iconPath
                          });
                        //Si no esta visitado icono de POI
                        } else {
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="icon ion-location"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels pois"
                          });
                        }
                        bounds.extend(routeLatLng);
                        map.fitBounds(bounds);
                        var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pois/' + poi.id + '">' +
                              '<i class="icon ion-location pois"></i>' +
                              '<div class="iw_title">' + poi.name + '</div></a>';

                        attachInfo($scope, map, marker, content, poi.id, poi.photosApp, poi.audios);
                      });
                    }
                  });

                  //RESTAURANTES
                  Favorite.getAllByType(itemsConfig.restaurantType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Restaurant.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
                        var routeLatLng = new google.maps.LatLng(restaurant.latitude, restaurant.longitude);
                        //Si esta visitado icono con numero
                        var visitedIndex = $scope.visitedPois.indexOf(restaurant.id);
                        if(visitedIndex > -1) {
                          iconPath = "img/markers/number_" + (visitedIndex + 1) + ".png";
                          var marker = new google.maps.Marker({
                            position: routeLatLng,
                            map: map,
                            icon: iconPath
                          });
                        //Si no esta visitado icono de RESTAURANTE
                        } else {
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="icon ion-android-restaurant"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels restaurants"
                          });
                        }
                        bounds.extend(routeLatLng);
                        map.fitBounds(bounds);
                        var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/restaurants/' + restaurant.id + '">' +
                              '<i class="icon ion-android-restaurant restaurants"></i>' +
                              '<div class="iw_title">' + restaurant.name + '</div></a>';

                        attachInfoRestaurant($scope, map, marker, content, restaurant.id, restaurant.photosApp, restaurant.audios);
                      });
                    }
                  });

                  //PUBS
                  Favorite.getAllByType(itemsConfig.pubType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Pub.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
                        var routeLatLng = new google.maps.LatLng(pub.latitude, pub.longitude);
                        //Si esta visitado icono con numero
                        var visitedIndex = $scope.visitedPois.indexOf(pub.id);
                        if(visitedIndex > -1) {
                          iconPath = "img/markers/number_" + (visitedIndex + 1) + ".png";
                          var marker = new google.maps.Marker({
                            position: routeLatLng,
                            map: map,
                            icon: iconPath
                          });
                        //Si no esta visitado icono de PUB
                        } else {
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="icon ion-android-bar"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels pubs"
                          });
                        }
                        bounds.extend(routeLatLng);
                        map.fitBounds(bounds);
                        var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/pubs/' + pub.id + '">' +
                              '<i class="icon ion-android-bar pubs"></i>' +
                              '<div class="iw_title">' + pub.name + '</div></a>';

                        attachInfoPub($scope, map, marker, content, pub.id, pub.photosApp, pub.audios);
                      });
                    }
                  });

                  //ALOJAMIENTO
                  Favorite.getAllByType(itemsConfig.accommodationType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Accommodation.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
                        var routeLatLng = new google.maps.LatLng(accommodation.latitude, accommodation.longitude);
                        //Si esta visitado icono con numero
                        var visitedIndex = $scope.visitedPois.indexOf(accommodation.id);
                        if(visitedIndex > -1) {
                          iconPath = "img/markers/number_" + (visitedIndex + 1) + ".png";
                          var marker = new google.maps.Marker({
                            position: routeLatLng,
                            map: map,
                            icon: iconPath
                          });
                        //Si no esta visitado icono de ACCOMMODATION
                        } else {
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="fa fa-bed"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels accommodations"
                          });
                        }
                        bounds.extend(routeLatLng);
                        map.fitBounds(bounds);
                        var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/accommodations/' + accommodation.id + '">' +
                              '<i class="icon fa fa-bed accommodations"></i>' +
                              '<div class="iw_title">' + accommodation.name + '</div></a>';

                        attachInfoAccommodation($scope, map, marker, content, accommodation.id, accommodation.photosApp, accommodation.audios);
                      });
                    }
                  });

                  //SHOP
                  Favorite.getAllByType(itemsConfig.shopType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Shop.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
                        var routeLatLng = new google.maps.LatLng(shop.latitude, shop.longitude);
                        //Si esta visitado icono con numero
                        var visitedIndex = $scope.visitedPois.indexOf(shop.id);
                        if(visitedIndex > -1) {
                          iconPath = "img/markers/number_" + (visitedIndex + 1) + ".png";
                          var marker = new google.maps.Marker({
                            position: routeLatLng,
                            map: map,
                            icon: iconPath
                          });
                        //Si no esta visitado icono de TIENDA
                        } else {
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="icon ion-bag"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels shops"
                          });
                        }
                        bounds.extend(routeLatLng);
                        map.fitBounds(bounds);
                        var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/shops/' + shop.id + '">' +
                              '<i class="icon ion-bag shops"></i>' +
                              '<div class="iw_title">' + shop.name + '</div></a>';

                        attachInfoShop($scope, map, marker, content, shop.id, shop.photosApp, shop.audios);
                      });
                    }
                  });

                  //EVENT
                  Favorite.getAllByType(itemsConfig.eventType, false).then(function(favorites) {
                    for (var i = 0; i < favorites.length; i++) {
                      Event.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {
                        if(event.latitude && event.longitude){
                          var routeLatLng = new google.maps.LatLng(event.latitude, event.longitude);
                          var marker = new MarkerWithLabel({
                            position: routeLatLng,
                            icon: ' ',
                            map: map,
                            labelContent: '<i class="icon ion-ios-book"></i>',
                            labelAnchor: new google.maps.Point(20, 25),
                            labelClass: "labels events"
                          });
                          bounds.extend(routeLatLng);
                          map.fitBounds(bounds);
                          var content = '<a class="item item-icon-left" id="iw_container" href="#/tab/events/' + event.eventId + '">' +
                                '<i class="icon ion-ios-book events"></i>' +
                                '<div class="iw_title">' + event.name + '</div></a>';
                          attachInfoEvent($scope, map, marker, content, event.eventId);
                        }
                      });
                    }
                  });
                });
              }, 'other_params':'key=API_KEY'
            });
      } else if($scope.offline) {
        map = L.map(document.getElementsByClassName("mapa-miviaje")[0]).setView([43.307646, -2.001380], 13);
        $scope.map = map;
        L.tileLayer($scope.fileSystem+$scope.appDirectory+$scope.appLanguage+'/mapTiles/{z}/{x}/{y}.jpg',
          {maxZoom: 16, minZoom: 13}).addTo(map);

        //MY POSITION
        var posOptions = {timeout: 10000, enableHighAccuracy: false};

        var myLatitude  = null;
        var myLongitude = null;
        
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          myLatitude  = position.coords.latitude;
          myLongitude = position.coords.longitude;
        

          L.marker([myLatitude, myLongitude], {icon: myLocationIcon}).addTo(map)
          .bindPopup($translate.instant("mapa.tuposicion"), {closeButton: false})
          .openPopup();

          //POIS
          Favorite.getAllByType(itemsConfig.poiType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Poi.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
                var itemLatLng = new L.LatLng(poi.latitude, poi.longitude);
                //Si esta visitado icono con numero
                var visitedIndex = $scope.visitedPois.indexOf(poi.id);
                var iconMarker = null;
                if(visitedIndex > -1) {
                  iconMarker = L.icon({
                    iconUrl: 'img/markers/number_' + (visitedIndex + 1) + '.png',
                    iconSize:     [32, 37], // size of the icon
                    popupAnchor:  [0, -40], // point from which the popup should open relative to the iconAnchor
                    iconAnchor:   [16, 37]
                });
                  
                //Si no esta visitado icono de POI
                } else {
                  iconMarker = L.AwesomeMarkers.icon({
                    icon: 'location',
                    prefix: 'ion',
                    markerColor: 'cadetblue'
                  });
                }

                var marker = L.marker([poi.latitude, poi.longitude], {icon: iconMarker});
                marker.addTo(map).bindPopup(poi.name, {closeButton: false});
                attachInfoOffline(marker, $scope, poi.id, poi.photosApp, poi.audios);
              });
            }
          });

          //RESTAURANTS
          Favorite.getAllByType(itemsConfig.restaurantType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Restaurant.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
                var itemLatLng = new L.LatLng(restaurant.latitude, restaurant.longitude);
                //Si esta visitado icono con numero
                var visitedIndex = $scope.visitedPois.indexOf(restaurant.id);
                var iconMarker = null;
                if(visitedIndex > -1) {
                  iconMarker = L.icon({
                    iconUrl: 'img/markers/number_' + (visitedIndex + 1) + '.png',
                    iconSize:     [32, 37], // size of the icon
                    popupAnchor:  [0, -40], // point from which the popup should open relative to the iconAnchor
                    iconAnchor:   [16, 37]
                });
                  
                //Si no esta visitado icono de RESTAURANTE
                } else {
                  iconMarker = L.AwesomeMarkers.icon({
                    icon: 'android-restaurant',
                    prefix: 'ion',
                    markerColor: 'orange'
                  });
                }

                var marker = L.marker([restaurant.latitude, restaurant.longitude], {icon: iconMarker});
                marker.addTo(map).bindPopup(restaurant.name, {closeButton: false});
                attachInfoOfflineRestaurant(marker, $scope, restaurant.id, restaurant.photosApp, restaurant.audios);
              });
            }
          });
          
          //PUBS
          Favorite.getAllByType(itemsConfig.pubType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Pub.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
                var itemLatLng = new L.LatLng(pub.latitude, pub.longitude);
                //Si esta visitado icono con numero
                var visitedIndex = $scope.visitedPois.indexOf(pub.id);
                var iconMarker = null;
                if(visitedIndex > -1) {
                  iconMarker = L.icon({
                    iconUrl: 'img/markers/number_' + (visitedIndex + 1) + '.png',
                    iconSize:     [32, 37], // size of the icon
                    popupAnchor:  [0, -40], // point from which the popup should open relative to the iconAnchor
                    iconAnchor:   [16, 37]
                });
                  
                //Si no esta visitado icono de BAR
                } else {
                  iconMarker = L.AwesomeMarkers.icon({
                    icon: 'android-bar',
                    prefix: 'ion',
                    markerColor: 'purple'
                  });
                }

                var marker = L.marker([pub.latitude, pub.longitude], {icon: iconMarker});
                marker.addTo(map).bindPopup(pub.name, {closeButton: false});
                attachInfoOfflinePub(marker, $scope, pub.id, pub.photosApp, pub.audios);
              });
            }
          });

          //ACCOMMODATIONS
          Favorite.getAllByType(itemsConfig.accommodationType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Accommodation.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
                var itemLatLng = new L.LatLng(accommodation.latitude, accommodation.longitude);
                //Si esta visitado icono con numero
                var visitedIndex = $scope.visitedPois.indexOf(accommodation.id);
                var iconMarker = null;
                if(visitedIndex > -1) {
                  iconMarker = L.icon({
                    iconUrl: 'img/markers/number_' + (visitedIndex + 1) + '.png',
                    iconSize:     [32, 37], // size of the icon
                    popupAnchor:  [0, -40], // point from which the popup should open relative to the iconAnchor
                    iconAnchor:   [16, 37]
                });
                  
                //Si no esta visitado icono de ACCOMMODATION
                } else {
                  iconMarker = L.AwesomeMarkers.icon({
                    icon: 'bed',
                    prefix: 'fa',
                    markerColor: 'red'
                  });
                }

                var marker = L.marker([accommodation.latitude, accommodation.longitude], {icon: iconMarker});
                marker.addTo(map).bindPopup(accommodation.name, {closeButton: false});
                attachInfoOfflineAccommodation(marker, $scope, accommodation.id, accommodation.photosApp, accommodation.audios);
              });
            }
          });

          //EVENTS
          Favorite.getAllByType(itemsConfig.eventType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Event.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {
                if(event.latitude && event.longitude){
                  var iconMarker = L.AwesomeMarkers.icon({
                    icon: 'ios-book',
                    prefix: 'ion',
                    markerColor: 'green'
                  });

                  var marker = L.marker([event.latitude, event.longitude], {icon: iconMarker});
                  marker.addTo(map).bindPopup(event.name, {closeButton: false});
                  attachInfoOfflineEvent(marker, $scope, event.eventId);
                }
              });
            }
          });

          //SHOPS
          Favorite.getAllByType(itemsConfig.shopType, false).then(function(favorites) {
            for (var i = 0; i < favorites.length; i++) {
              Shop.getById(favorites[i].item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
                var itemLatLng = new L.LatLng(shop.latitude, shop.longitude);
                //Si esta visitado icono con numero
                var visitedIndex = $scope.visitedPois.indexOf(shop.id);
                var iconMarker = null;
                if(visitedIndex > -1) {
                  iconMarker = L.icon({
                    iconUrl: 'img/markers/number_' + (visitedIndex + 1) + '.png',
                    iconSize:     [32, 37], // size of the icon
                    popupAnchor:  [0, -40], // point from which the popup should open relative to the iconAnchor
                    iconAnchor:   [16, 37]
                });
                  
                //Si no esta visitado icono de TIENDA
                } else {
                  iconMarker = L.AwesomeMarkers.icon({
                    icon: 'bag',
                    prefix: 'ion',
                    markerColor: 'blue'
                  });
                }

                var marker = L.marker([shop.latitude, shop.longitude], {icon: iconMarker});
                marker.addTo(map).bindPopup(shop.name, {closeButton: false});
                attachInfoOfflineShop(marker, $scope, shop.id, shop.photosApp, shop.audios);
              });
            }
          });
        });
      } else {
        $scope.showConfirm("tab/miviaje");
      }
    });
  }

  $scope.miViajeFavoritos = function () {
    $scope.visited = false;
    $location.path("tab/miviaje");
  };

  $scope.miViajeVisitados = function () {
    $scope.visited = true;
    $location.path("tab/miviaje/visitados");
  };

  $scope.miViajeMapa = function () {
    $location.path("tab/miviaje/mapa");
  };

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
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      scope.tipoPoi = "pois";
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
      scope.tipoPoi = "pois";
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
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      scope.tipoPoi = "restaurants";
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
      scope.tipoPoi = "restaurants";
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
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      scope.tipoPoi = "pubs";
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
      scope.tipoPoi = "pubs";
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
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      scope.tipoPoi = "accommodations";
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
      scope.tipoPoi = "accommodations";
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
    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      scope.tipoPoi = "shops";
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
      scope.tipoPoi = "shops";
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
    if(states.stateName == "tab.miviajeMapa") {
      $scope.initialize();
    }
  });

  $scope.miViajeMapaFiltroDialog = function() {
    $location.path("tab/miviaje");
    $scope.buildFilter();
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroMiviaje.html',
      scope: $scope
    });

    $scope.selectType = function() {
      alertPopup.close();
    }
  };

  $scope.toggleSidebar = function() {
    $ionicSideMenuDelegate.toggleLeft($scope);
  };

})