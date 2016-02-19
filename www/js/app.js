// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.filesController', 'starter.miviajecontrollers', 'starter.mapacontrollers', 'starter.services', 'starter.filesServices', 'starter.directives', 'pascalprecht.translate', 'ionic-audio', 'ionic.rating', 'ngDialog', 'angularModalService'])

.run(function($rootScope, $ionicPlatform, $ionicNavBarDelegate, $cordovaNetwork, DB) {
  $ionicPlatform.ready(function() {
    //DB.init();
    $ionicNavBarDelegate.showBackButton(false);
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.transition('none');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: "GlobalCtrl"
  })

  // Each tab has its own nav history stack:

  .state('tab.guia', {
    url: '/guia',
    views: {
      'tab-guia': {
        templateUrl: 'templates/tab-guia.html',
        //templateUrl: 'templates/rutas.html',
        controller: 'GuiaCtrl',
        controller: 'FilesCtrl'
        
        
      }
    }
  })

  .state('tab.overlay', {
    url: '/overlay',
    views: {
      'tab-guia': {
        templateUrl: 'templates/tab-guia-overlay.html',
        controller: 'GuiaCtrl',
        controller: 'FilesCtrl'
      }
    }
  })

  .state('tab.home-destination', {
    url: '/home-destination',
    views: {
        'tab-guia': {
            templateUrl: 'templates/home-destination.html',
            controller: '',
        }
    }
  })

// POIS
  .state('tab.pois', {
    url: '/pois',
    views: {
        'tab-guia': {
            templateUrl: 'templates/pois.html',
            controller: 'PoisCtrl',
        }
    }
  })

  .state('tab.poi', {
    url: '/pois/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/poi.html',
            controller: 'PoiCtrl',
        }
    }
  })

  .state('tab.opinionesPoi', {
    url: '/pois/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.mapaPoi', {
    url: '/pois/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapa.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarPoi', {
    url: '/pois/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

// RUTAS

  .state('tab.rutas', {
    url: '/rutas',
    views: {
        'tab-guia': {
            templateUrl: 'templates/rutas.html',
            controller: 'RutasCtrl',
        }
    }
  })

  .state('tab.ruta', {
    url: '/rutas/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/ruta.html',
            controller: 'RutaCtrl',
        }
    }
  })

  .state('tab.opinionesRuta', {
    url: '/rutas/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.poisRuta', {
    url: '/rutas/pois/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/poisRuta.html',
            controller: 'PoisRutaCtrl',
        }
    }
  })

  .state('tab.transmedia', {
    url: '/rutas/transmedia/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/transmedia.html',
            controller: 'TransmediaCtrl',
        }
    }
  })

  .state('tab.mapaRuta', {
    url: '/rutas/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaRuta.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarRuta', {
    url: '/rutas/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

  .state('tab.informacion', {
    url: '/informacion',
    views: {
        'tab-guia': {
            templateUrl: 'templates/informacion.html',
            controller: 'InformacionCtrl',
        }
    }
  })

  // RESTAURANTES
  .state('tab.restaurants', {
    url: '/restaurants',
    views: {
        'tab-guia': {
            templateUrl: 'templates/restaurants.html',
            controller: 'RestaurantsCtrl',
        }
    }
  })

  .state('tab.restaurant', {
    url: '/restaurants/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/restaurant.html',
            controller: 'RestaurantCtrl',
        }
    }
  })

  .state('tab.opinionesRestaurant', {
    url: '/restaurants/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.mapaRestaurant', {
    url: '/restaurants/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaRestaurant.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarRestaurant', {
    url: '/restaurants/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

  // PUBS
  .state('tab.pubs', {
    url: '/pubs',
    views: {
        'tab-guia': {
            templateUrl: 'templates/pubs.html',
            controller: 'PubsCtrl',
        }
    }
  })

  .state('tab.pub', {
    url: '/pubs/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/pub.html',
            controller: 'PubCtrl',
        }
    }
  })

  .state('tab.opinionesPub', {
    url: '/pubs/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.mapaPub', {
    url: '/pubs/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaPub.html',
            controller: 'MapaCtrl',
        }
    }
  })

  /*.state('tab.mapaRoutePub', {
    url: '/rutas/:routeId/pubs/mapa/:id',
    views: {
        '': {
            templateUrl: 'templates/mapaPub.html',
            controller: 'MapaRutaCtrl',
        }
    }
  })*/

  .state('tab.comentarPub', {
    url: '/pubs/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })
// ACCOMMODATIONS
  .state('tab.accommodations', {
    url: '/accommodations',
    views: {
        'tab-guia': {
            templateUrl: 'templates/accommodations.html',
            controller: 'AccommodationsCtrl',
        }
    }
  })

  .state('tab.accommodation', {
    url: '/accommodations/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/accommodation.html',
            controller: 'AccommodationCtrl',
        }
    }
  })

  .state('tab.opinionesAccommodation', {
    url: '/accommodations/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.mapaAccommodation', {
    url: '/accommodations/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaAccommodation.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarAccommodation', {
    url: '/accommodations/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

// SHOPS
  .state('tab.shops', {
    url: '/shops',
    views: {
        'tab-guia': {
            templateUrl: 'templates/shops.html',
            controller: 'ShopsCtrl',
        }
    }
  })

  .state('tab.shop', {
    url: '/shops/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/shop.html',
            controller: 'ShopCtrl',
        }
    }
  })

  .state('tab.opinionesShop', {
    url: '/shops/opiniones/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/opiniones.html',
            controller: 'OpinionesCtrl',
        }
    }
  })

  .state('tab.mapaShop', {
    url: '/shops/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaShop.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarShop', {
    url: '/shops/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

// EVENTS
  .state('tab.events', {
    url: '/events',
    views: {
        'tab-guia': {
            templateUrl: 'templates/events.html',
            controller: 'EventsCtrl',
        }
    }
  })

  .state('tab.event', {
    url: '/events/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/event.html',
            controller: 'EventCtrl',
        }
    }
  })

  .state('tab.mapaEvent', {
    url: '/events/mapa/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/mapaEvent.html',
            controller: 'MapaCtrl',
        }
    }
  })

  .state('tab.comentarEvent', {
    url: '/events/comentar/:id',
    views: {
        'tab-guia': {
            templateUrl: 'templates/comentar.html',
            controller: 'ComentarCtrl',
        }
    }
  })

// MI VIAJE

  .state('tab.miviaje', {
    url: '/miviaje',
    views: {
      'tab-guia': {
        templateUrl: 'templates/tab-miviaje.html',
        controller: 'MiViajeCtrl'
      }
    }
  })

  .state('tab.miviajevisitados', {
    url: '/miviaje/visitados',
    views: {
      'tab-guia': {
        templateUrl: 'templates/tab-miviaje-visitados.html',
        controller: 'MiViajeCtrl'
      }
    }
  })

  .state('tab.miviajeMapa', {
    url: '/miviaje/mapa',
    views: {
      'tab-guia': {
        templateUrl: 'templates/mapa-miviaje.html',
        controller: 'MiViajeMapaCtrl'
      }
    }
  })

// MAPA PUNTOS CERCANOS

  .state('tab.mapa', {
    url: '/mapa',
    views: {
      'tab-guia': {
        templateUrl: 'templates/tab-mapa.html',
        controller: 'MapaCercanoCtrl'
      }
    }
  })

  // SETTINGS

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-guia': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('appDeactivated', {
    url: '/deactivated',
    views: {
      '': {
        templateUrl: 'templates/deactivated.html',
        controller: 'deactvController'
      }
    }
  })

  .state('home1', {
    url: '/home1',
    views: {
      '': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  
  .state('home', {
    url: '/home',
    views: {
      '': {
        templateUrl: '',
        //templateUrl: 'templates/tab-guia.html',
        controller: 'InitCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
  //$urlRouterProvider.otherwise('/guia');

  //INTERNATIONALIZATION
  $translateProvider.useStaticFilesLoader({
      prefix: 'languages/',
      suffix: '.json'
  });

  $translateProvider.preferredLanguage("es_ES");
  $translateProvider.fallbackLanguage("es_ES");

  $ionicConfigProvider.tabs.position("bottom");

});
