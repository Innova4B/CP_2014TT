angular.module('starter.controllers', ['starter.config', 'ngCordova'])

.controller('InitCtrl', function($scope, $translate, $location, pathConfig, DB){

    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        //Android and iOS
        console.log("Android and iOS"); 
        document.addEventListener('deviceready',initialSelection,true); 
    }
    else{
      $location.path( "/home1" );
    }


    function initialSelection(){
      var querySelect = 'SELECT app_Lang FROM configuration';
      var results = [];
      var firstTime = false;
      var langKey = "";
      DB.selectQuery(querySelect)
        .then(
          function(config){
            if(config.length>0){
              console.log("Selected language: "+config[0].app_Lang);
              langKey= $translate.instant(config[0].app_Lang);
              $translate.use(langKey);
              $location.path("tab/guia");
            }else{
                $location.path( "/home1" );
            }
          }
        );
    }
})

//HOME
.controller('HomeCtrl', function($scope, pathConfig, Languages) {
  window.requestFileSystem(PERSISTENT,20*1024*1024, okFileSys, koFileSys);

  function okFileSys(fs){
    $scope.fileSystem = fs.root.toURL();
    var appDirectory = pathConfig.appDirectory;

    Languages.getValues($scope.fileSystem, appDirectory).then(function(langs){
      $scope.langs = langs;
    });

  }

  function koFileSys(){
    alert("ErrorFileSystem");
  }

})

.controller('GlobalCtrl', function($rootScope, $scope, $translate, $location, $ionicViewSwitcher, pathConfig, DB, $window, itemsConfig, Favorite, Offline, AppVersion, Languages, PoiComments, RouteComments, Destination, Organization){

  $scope.fileSystem = "";
  $scope.appDirectory = "json/es";
  $scope.appLanguage = "";
  $rootScope.pathMiViaje = false;
  $scope.offline = 0;
  $scope.appVersion = "";
  $scope.langs = [];
  $scope.destination = "Tourist Tour";
  $scope.guideImage = "img/guideImage.png";
  $scope.temp = null;
  $scope.activeMenu = null;
  $scope.selectedValue = {value: 0};
  
  $scope.visitedPois = [];
  $scope.visitedRoutes = [];
  $scope.visitedEvents = [];

  $scope.poiRatings = [];

  $rootScope.idOrganization = null;
  $rootScope.idDestination = null;

  Organization.getValue().then(function(idOrganization){
    $rootScope.idOrganization = idOrganization;
  });

  Destination.getValue().then(function(idDestination){
    $rootScope.idDestination = idDestination;
  });

  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {

      //Android and iOS
      console.log("Android and iOS"); 
      //document.addEventListener('deviceready',initialSelection,true);
      initialSelection();
      window.requestFileSystem(PERSISTENT,20*1024*1024, okFileSys, koFileSys);
  }

  function okFileSys(fs){
    $scope.fileSystem = fs.root.toURL();
    var appDirectory = pathConfig.appDirectory;

    Offline.getValue($scope.fileSystem, appDirectory).then(function(offline){
      $scope.offline = offline;
    });

    AppVersion.getValue($scope.fileSystem, appDirectory).then(function(appVersion){
      $scope.appVersion = appVersion;
    });

    PoiComments.getRatings($scope.fileSystem, appDirectory).then(function(ratings){
      $scope.poiRatings = ratings;
    });

    RouteComments.getRatings($scope.fileSystem, appDirectory).then(function(ratings){
      $scope.routeRatings = ratings;
    });

  }

  function koFileSys(){
    alert("ErrorFileSystem");
  }

  function initialSelection(){
    var querySelect = 'SELECT app_Lang, version FROM configuration';
    var results = [];
    var firstTime = false;
    var langKey = "";
    DB.selectQuery(querySelect)
      .then(
        function(config){
          if(config.length>0){
            console.log("Selected language: "+config[0].app_Lang);
            langKey= $translate.instant(config[0].app_Lang);
            $scope.appLanguage = config[0].app_Lang;
            $scope.appDirectory = pathConfig.appDirectory;
            $scope.versionApp = config[0].version;
          }
        }
      );
  }

  $scope.getVisitedPois = function() {
    Favorite.getAllVisitedByType(itemsConfig.poiType).then(function(visited) {
      for (var i = 0; i < visited.length; i++) {
        $scope.visitedPois.push(parseInt(visited[i].item_id));

      };
    });
  }

  $scope.getVisitedRoutes = function() {
    Favorite.getAllVisitedByType(itemsConfig.routeType).then(function(visited) {
      for (var i = 0; i < visited.length; i++) {
        $scope.visitedRoutes.push(visited[i].item_id);
      };
    });
  }

  $scope.getVisitedEvents = function() {
    Favorite.getAllVisitedByType(itemsConfig.eventType).then(function(visited) {
      for (var i = 0; i < visited.length; i++) {
        $scope.visitedEvents.push(visited[i].item_id);
      };
    });
  }

  $scope.getVisitedPois();
  $scope.getVisitedRoutes();
  $scope.getVisitedEvents();

})

.controller('GuiaCtrl', function($scope, $state, $location, $translate, $ionicPopup, $ionicPlatform, ngDialog, Temp) {
  $scope.activeMenu = 'home';

  Temp.getValue($scope.destination).then(function(temp){
    $scope.temp = temp;
  });

  Temp.getIcon($scope.destination).then(function(icon){
    $scope.icon = icon;
  });

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/tab-guia-overlay.html', disableAnimation: false, showClose: false  });
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $ionicPlatform.onHardwareBackButton(function onBackKeyDown(e) {
    removeElementsByClass("ngdialog");
    $location.path("tab/guia");
    if($state.current.name=="tab.guia")
      ionic.Platform.exitApp();
  });
})

/* ----- POIS ----- */
.controller('PoisCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup,$ionicScrollDelegate, itemsConfig, Poi, Favorite, $window, $ionicPopover) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });

  var start = new Date().getTime();
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};
  $scope.filtroPrecio = {value: 0};

  Poi.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      if($scope.categories[i]!=undefined) {
        $scope.filtro.push({
          text: $scope.categories[i],
          enabled: true
        });
      }
    }
  })

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Distancia"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("Precio"), 'value': 1});
    $scope.filtroTipo.push({'text': $translate.instant("Valoracion"), 'value': 2});

  };

  $scope.buildFilter();

  $scope.selectType = function() {
    if($scope.selectedValue.value == 0){
      $scope.pois = $scope.pois.sort(sortByDistance);
    } else if ($scope.selectedValue.value == 1) {
      $scope.pois = $scope.pois.sort(sortByPrice);
    }
  }

  $scope.updateList = function() {
    Poi.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pois){
      /*$scope.allPois = pois.data;
      $scope.noMoreItemsAvailable = false;
      if($scope.allPois.length > 10) {
        $scope.pois = pois.data.slice(0,10);
        $scope.noMoreItemsAvailable = true;
      } else {
        $scope.pois = pois.data;
      }*/

      $scope.pois = pois.data;
      
      for(i=0;i<pois.data.length;i++) {
        pois.data[i].visible = true;
        if($scope.filtroDisabled.enabled) {
          pois.data[i].visible = pois.data[i].disabledFriendly;
        }
        if($scope.filtroChild.enabled) {
          pois.data[i].visible = pois.data[i].childFriendly;
        }
        if(pois.data[i].visible && $scope.filtro.length) {
          var $categoria = $scope.filtro.filter(function( obj ) {
            for(var j = 0; j<pois.data[i].tags.length; j++) {
              if(obj.text == pois.data[i].tags[j])
                return true;
            }
          });
          if($categoria.length)
            pois.data[i].visible = $categoria[0].enabled;
          else
            pois.data[i].visible = false;
        }

        pois.data[i].avgRating = $scope.poiRatings[pois.data[i].id];
      }

      if ($scope.selectedValue.value == 1) {
        $scope.pois = $scope.pois.sort(sortByPrice);
      } else if ($scope.selectedValue.value == 2) {
        $scope.pois = $scope.pois.sort(sortByRating);
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        for(i=0 ;i<=pois.data.length-1;i++) {
          pois.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, pois.data[i].latitude, pois.data[i].longitude);
        }
        //$scope.pois = $scope.pois.sort(sortByDistance);
        if($scope.selectedValue.value == 0){
          $scope.pois = $scope.pois.sort(sortByDistance);
        }
        for(i=0 ;i<=pois.data.length-1;i++) {
          if (pois.data[i].distance < 1)
            pois.data[i].distance = (pois.data[i].distance*1000).toFixed(0) + ' m';
          else
            pois.data[i].distance = pois.data[i].distance.toFixed(0) + ' km';
        }
      }, function(error) {
        console.log("Geolocation error code " + error.code + ": " + error.message);
      });
    })
    $ionicScrollDelegate.scrollTop(true);
  }

  $scope.loadMore = function() {
    console.log("loadMore");
    var numLoaded = $scope.pois.length;
    if(numLoaded+10<$scope.allPois.length) {
      newPois = $scope.allPois.slice(numLoaded, numLoaded + 10);
      $scope.pois = $scope.pois.concat(newPois);
    } else {
      $scope.pois = $scope.allPois;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  

  $scope.updateList();

  $scope.onHold = function (poi) {
    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
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
  $scope.isRoute = function () {
      return false;
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

  $scope.showSortDialog = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroOrden.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };
  

})

.controller('PoiCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, $sce, $cordovaNetwork, Poi, ngDialog) {

  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = "#/tab/pois";

  $scope.transmedia = false;
  var poi_id = $stateParams.id;
  $scope.position = 'info';

  Poi.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
    $scope.poi = poi;
    if(poi.video && $cordovaNetwork.isOnline()) {
      $scope.video=true;
    } else {
      $scope.video=false;
      $ionicSlideBoxDelegate.update();
    }
  })

  $scope.poiInfo = function () {
    $location.path("tab/pois/" + poi_id);
    $scope.closeDialog();
  };

  $scope.poiOpinion = function () {
    $location.path("tab/pois/opiniones/" + poi_id);
    $scope.closeDialog();
  };

  $scope.poiMapa = function () {
    $location.path("tab/pois/mapa/" + poi_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/pois/comentar/" + poi_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-poi.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.poi.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.poi.phone, '_system');
  }

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/pois/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

.controller('OpinionesCtrl', function($rootScope, $scope, $state, $stateParams, $location, Poi, Restaurant, Pub, Accommodation, Shop, Ruta, PoiComments, RouteComments, ngDialog) {

  var poi_id = $stateParams.id;
  var current_state = $state.current.name;
  $scope.tipo = null;
  $scope.position = "opinion";

  switch(current_state) {
    case 'tab.opinionesPoi':
      $scope.avgRating = $scope.poiRatings[poi_id];
      $scope.tipo = 'pois';
      Poi.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      });
      break;
    case 'tab.opinionesRestaurant':
      $scope.avgRating = $scope.poiRatings[poi_id];
      $scope.tipo = 'restaurants';
      Restaurant.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      });
      break;
    case 'tab.opinionesPub':
      $scope.avgRating = $scope.poiRatings[poi_id];
      $scope.tipo = 'pubs';
      Pub.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      });
      break;
    case 'tab.opinionesAccommodation':
      $scope.avgRating = $scope.poiRatings[poi_id];
      $scope.tipo = 'accommodations';
      Accommodation.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      });
      break;
    case 'tab.opinionesShop':
      $scope.avgRating = $scope.poiRatings[poi_id];
      $scope.tipo = 'shops';
      Shop.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      });
      break;
    case 'tab.opinionesRuta':
      $scope.avgRating = $scope.routeRatings[poi_id];
      $scope.tipo = 'rutas';
      Ruta.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(item) {
        $scope.title = item.title;
      }); 
      break;
  }

  if($scope.tipo!='rutas') {
    PoiComments.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(comments) {
      $scope.opiniones = comments;
    })
  } else {
    RouteComments.getById(poi_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(comments) {
      $scope.opiniones = comments;
    })
  }

  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = "#/tab/" + $scope.tipo;

  $scope.poiInfo = function () {
    $scope.tipo = $state.current.url.split('/')[1];
    $location.path("tab/" + $scope.tipo + "/" + poi_id);
    $scope.closeDialog();
  };

  $scope.poiPuntos = function () {
    $location.path("tab/rutas/pois/" + poi_id);
    $scope.closeDialog();
  };

  $scope.poiOpinion = function () {
    $scope.tipo = $state.current.url.split('/')[1];
    $location.path("tab/" + $scope.tipo + "/opiniones/" + poi_id);
    $scope.closeDialog();
  };

  $scope.poiMapa = function () {
    $scope.tipo = $state.current.url.split('/')[1];
    $location.path("tab/" + $scope.tipo + "/mapa/" + poi_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/" + $scope.tipo + "/comentar/" + poi_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-opinion.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.poi.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.poi.phone, '_system');
  }

  $scope.isRoute = function () {
    if($scope.tipo=='rutas')
      return true;
    else
      return false;
  }

})

.controller('ComentarCtrl', function($scope, $state, $stateParams, $location, $translate, Poi, Ruta, Restaurant, Pub, Accommodation, Shop, SocialComment, itemsConfig, ngDialog) {
  
  var item_id = $stateParams.id;
  $scope.formData = {};
  $scope.score = 1;
  $scope.tipo = null;
  $scope.itemType = null;

  $scope.position = "comment";

  $scope.max=5;
  $scope.rate=1;
  
  var current_state = $state.current.name;

  //En funcion de current_state sabemos en que estado estamos
  switch(current_state) {
    case 'tab.comentarPoi':
      $scope.tipo = "pois";
      $scope.itemType = itemsConfig.poiType;
      Poi.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(poi) {
        $scope.item = poi;
      });
      break;
    case 'tab.comentarRestaurant':
      $scope.tipo = "restaurants";
      $scope.itemType = itemsConfig.restaurantType;
      Restaurant.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
        $scope.item = restaurant;
      });
      break;
    case 'tab.comentarPub':
      $scope.tipo = "pubs";
      $scope.itemType = itemsConfig.pubType;
      Pub.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
        $scope.item = pub;
      });
      break;
    case 'tab.comentarAccommodation':
      $scope.tipo = "accommodations";
      $scope.itemType = itemsConfig.accommodationType;
      Accommodation.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
        $scope.item = accommodation;
      });
      break;
    case 'tab.comentarShop':
      $scope.tipo = "shops";
      $scope.itemType = itemsConfig.shopType;
      Shop.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
        $scope.item = shop;
      });
      break;
    case 'tab.comentarRuta':
      $scope.tipo = "rutas";
      $scope.itemType = itemsConfig.routeType;
      Ruta.getById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(ruta) {
        $scope.item = ruta;
      });
      break;
  }

  $scope.addComment = function() {
    userRating = document.getElementById("comment-rate").innerHTML;
    SocialComment.add($scope.itemType,$scope.formData.user,$scope.formData.comment, userRating, item_id).then(function(result){
      if(result) {
        $location.path("tab/" + $scope.tipo + "/" + item_id);
        window.plugins.toast.showLongTop($translate.instant("toast.comentario"));
      }
    });
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
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-comment.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    if(states.stateName == "tab.comentarPoi" || states.stateName == "tab.comentarRuta" || states.stateName == "tab.comentarRestaurant" || states.stateName == "tab.comentarPub" || states.stateName == "tab.comentarAccommodation" || states.stateName == "tab.comentarShop" || states.stateName == "tab.comentarEvent") {
      //$scope.init();
    }
  });

})

/* ----- RESTAURANTES ----- */

.controller('RestaurantsCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup, $ionicScrollDelegate, itemsConfig, Restaurant, Favorite, $window) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  Restaurant.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      if($scope.categories[i]!=undefined) {
        $scope.filtro.push({
          text: $scope.categories[i],
          enabled: true
        });
      }
    }
  })

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Distancia"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("Precio"), 'value': 1});
    $scope.filtroTipo.push({'text': $translate.instant("Valoracion"), 'value': 2});

  };

  $scope.buildFilter();

  $scope.updateList = function() {
    Restaurant.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurants){
      
      //$scope.restaurants = restaurants.data;
      /*$scope.allRestaurants = restaurants.data;
      $scope.noMoreItemsAvailable = false;
      if($scope.allRestaurants.length > 10) {
        $scope.restaurants = restaurants.data.slice(0,10);
        $scope.noMoreItemsAvailable = true;
      } else {
        $scope.restaurants = restaurants.data;
      }*/

      $scope.restaurants = restaurants.data;

      for(i=0;i<restaurants.data.length;i++) {
        restaurants.data[i].visible = true;
        if($scope.filtroDisabled.enabled) {
          restaurants.data[i].visible = restaurants.data[i].disabledFriendly;
        }
        if($scope.filtroChild.enabled) {
          restaurants.data[i].visible = restaurants.data[i].childFriendly;
        }
        if(restaurants.data[i].visible && $scope.filtro.length) {
          var $categoria = $scope.filtro.filter(function( obj ) {
            for(var j = 0; j<restaurants.data[i].tags.length; j++) {
              if(obj.text == restaurants.data[i].tags[j])
                return true;
            }
          });
          if($categoria.length)
            restaurants.data[i].visible = $categoria[0].enabled;
          else
            restaurants.data[i].visible = false;
        }
        restaurants.data[i].avgRating = $scope.poiRatings[restaurants.data[i].id];
      }

      if ($scope.selectedValue.value == 1) {
        $scope.restaurants = $scope.restaurants.sort(sortByPrice);
      } else if ($scope.selectedValue.value == 2) {
        $scope.restaurants = $scope.restaurants.sort(sortByRating);
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        for(i=0 ;i<=restaurants.data.length-1;i++) {
          restaurants.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, restaurants.data[i].latitude, restaurants.data[i].longitude);
        }
        if($scope.selectedValue.value == 0){
          $scope.restaurants = $scope.restaurants.sort(sortByDistance);
        }
        for(i=0 ;i<=restaurants.data.length-1;i++) {
          if (restaurants.data[i].distance < 1)
            restaurants.data[i].distance = (restaurants.data[i].distance*1000).toFixed(0) + ' m';
          else
            restaurants.data[i].distance = restaurants.data[i].distance.toFixed(0) + ' km';
        }
      });
    })
    $ionicScrollDelegate.scrollTop(true);
  }

  $scope.loadMore = function() {
    var numLoaded = $scope.restaurants.length;
    if(numLoaded+10<$scope.allRestaurants.length) {
      newRestaurants = $scope.allRestaurants.slice(numLoaded, numLoaded + 10);
      $scope.restaurants = $scope.restaurants.concat(newRestaurants);
    } else {
      $scope.restaurants = $scope.allRestaurants;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.updateList();

  $scope.onHold = function (restaurant) {

    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.restaurantType,restaurant.id).then(function(result) {
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        console.log(isVisited);
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.restaurantType,restaurant.id);
              } else {
                Favorite.addFavorite(itemsConfig.restaurantType,restaurant.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/restaurants/comentar/" + restaurant.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.restaurantType,restaurant.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(restaurant.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.restaurantType,restaurant.id,true);
                $scope.visitedPois.push(parseInt(restaurant.id));
              }
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

  $scope.showSortDialog = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroOrden.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

})

.controller('RestaurantCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, $sce, $cordovaNetwork, Restaurant, ngDialog) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/restaurants'

  var restaurant_id = $stateParams.id;
  $scope.position = "info";

  Restaurant.getById(restaurant_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(restaurant) {
    $scope.restaurant = restaurant;
    if(restaurant.video && $cordovaNetwork.isOnline()) {
      $scope.video=true;
    } else {
      $scope.video=false;
      $ionicSlideBoxDelegate.update();
    }

  })

  $scope.restaurantInfo = function () {
    $location.path("tab/restaurants/" + restaurant_id);
    $scope.closeDialog();
  };

  $scope.restaurantOpinion = function () {
    $location.path("tab/restaurants/opiniones/" + restaurant_id);
    $scope.closeDialog();
  };

  $scope.restaurantMapa = function () {
    $location.path("tab/restaurants/mapa/" + restaurant_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/restaurants/comentar/" + restaurant_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-restaurant.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.restaurant.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.restaurant.phone, '_system');
  }

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/restaurants/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

/* ----- PUBS ----- */

.controller('PubsCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup, $ionicScrollDelegate, itemsConfig, Pub, Favorite, $window) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  Pub.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      if($scope.categories[i]!=undefined) {
        $scope.filtro.push({
          text: $scope.categories[i],
          enabled: true
        });
      }
    }
  })

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Distancia"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("Precio"), 'value': 1});
    $scope.filtroTipo.push({'text': $translate.instant("Valoracion"), 'value': 2});

  };

  $scope.buildFilter();

  $scope.updateList = function() {
    Pub.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pubs){
      //$scope.pubs = pubs.data;

      /*$scope.allItems = pubs.data;
      $scope.noMoreItemsAvailable = false;
      if($scope.allItems.length > 10) {
        $scope.pubs = pubs.data.slice(0,10);
        $scope.noMoreItemsAvailable = true;
      } else {
        $scope.pubs = pubs.data;
      }*/

      $scope.pubs = pubs.data;

      for(i=0 ;i<=pubs.data.length-1;i++) {
        pubs.data[i].visible = true;
        if($scope.filtroDisabled.enabled) {
          pubs.data[i].visible = pubs.data[i].disabledFriendly;
        }
        if($scope.filtroChild.enabled) {
          pubs.data[i].visible = pubs.data[i].childFriendly;
        }
        if(pubs.data[i].visible && $scope.filtro.length) {
          var $categoria = $scope.filtro.filter(function( obj ) {
            for(var j = 0; j<pubs.data[i].tags.length; j++) {
              if(obj.text == pubs.data[i].tags[j])
                return true;
            }
          });
          
          if($categoria.length)
            pubs.data[i].visible = $categoria[0].enabled;
          else
            pubs.data[i].visible = false;

        }

        pubs.data[i].avgRating = $scope.poiRatings[pubs.data[i].id];
      }

      if ($scope.selectedValue.value == 1) {
        $scope.pubs = $scope.pubs.sort(sortByPrice);
      } else if ($scope.selectedValue.value == 2) {
        $scope.pubs = $scope.pubs.sort(sortByRating);
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        for(i=0 ;i<=pubs.data.length-1;i++) {
          pubs.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, pubs.data[i].latitude, pubs.data[i].longitude);
        }
        if($scope.selectedValue.value == 0){
          $scope.pubs = $scope.pubs.sort(sortByDistance);
        }
        for(i=0 ;i<=pubs.data.length-1;i++) {
          if (pubs.data[i].distance < 1)
            pubs.data[i].distance = (pubs.data[i].distance*1000).toFixed(0) + ' m';
          else
            pubs.data[i].distance = pubs.data[i].distance.toFixed(0) + ' km';
        }
      });
    })
    $ionicScrollDelegate.scrollTop(true);
  }

  $scope.loadMore = function() {
    var numLoaded = $scope.pubs.length;
    if(numLoaded+10<$scope.allItems.length) {
      newItems = $scope.allItems.slice(numLoaded, numLoaded + 10);
      $scope.pubs = $scope.pubs.concat(newItems);
    } else {
      $scope.pubs = $scope.allItems;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.updateList();

  $scope.onHold = function (pub) {

    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.pubType,pub.id).then(function(result) {
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        console.log(isVisited);
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.pubType,pub.id);
              } else {
                Favorite.addFavorite(itemsConfig.pubType,pub.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/pubs/comentar/" + pub.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.pubType,pub.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(pub.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.pubType,pub.id,true);
                $scope.visitedPois.push(parseInt(pub.id));
              }
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

  $scope.showSortDialog = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroOrden.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

})

.controller('PubCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, $sce, $cordovaNetwork, Pub, ngDialog) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/pubs'

  var pub_id = $stateParams.id;
  $scope.position = "info";

  Pub.getById(pub_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pub) {
    $scope.pub = pub;
    if(pub.video && $cordovaNetwork.isOnline()) {
      $scope.video=true;
    } else {
      $scope.video=false;
      $ionicSlideBoxDelegate.update();
    }

  })

  $scope.pubInfo = function () {
    $location.path("tab/pubs/" + pub_id);
    $scope.closeDialog();
  };

  $scope.pubOpinion = function () {
    $location.path("tab/pubs/opiniones/" + pub_id);
    $scope.closeDialog();
  };

  $scope.pubMapa = function () {
    $location.path("tab/pubs/mapa/" + pub_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/pubs/comentar/" + pub_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-pub.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.pub.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.pub.phone, '_system');
  }

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/pubs/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

/* ----- ACCOMMODATIONS ----- */

.controller('AccommodationsCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup, $ionicScrollDelegate, itemsConfig, Accommodation, Favorite, $window) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  Accommodation.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      if($scope.categories[i]!=undefined) {
        $scope.filtro.push({
          text: $scope.categories[i],
          enabled: true
        });
      }
    }
  })

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Distancia"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("Precio"), 'value': 1});
    $scope.filtroTipo.push({'text': $translate.instant("Valoracion"), 'value': 2});

  };

  $scope.buildFilter();

  $scope.updateList = function() {
    Accommodation.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodations){
      //scope.accommodations = accommodations.data;

      /*$scope.allItems = accommodations.data;
      $scope.noMoreItemsAvailable = false;
      if($scope.allItems.length > 10) {
        $scope.accommodations = accommodations.data.slice(0,10);
        $scope.noMoreItemsAvailable = true;
      } else {
        $scope.accommodations = accommodations.data;
      }*/

      $scope.accommodations = accommodations.data;

      for(i=0 ;i<=accommodations.data.length-1;i++) {
        accommodations.data[i].visible = true;
        if($scope.filtroDisabled.enabled) {
          accommodations.data[i].visible = accommodations.data[i].disabledFriendly;
        }
        if($scope.filtroChild.enabled) {
          accommodations.data[i].visible = accommodations.data[i].childFriendly;
        }
        if(accommodations.data[i].visible && $scope.filtro.length) {
          var $categoria = $scope.filtro.filter(function( obj ) {
            for(var j = 0; j<accommodations.data[i].tags.length; j++) {
              if(obj.text == accommodations.data[i].tags[j])
                return true;
            }
          });
          
          if($categoria.length)
            accommodations.data[i].visible = $categoria[0].enabled;
          else
            accommodations.data[i].visible = false;
        }
        accommodations.data[i].avgRating = $scope.poiRatings[accommodations.data[i].id];
      }

      if ($scope.selectedValue.value == 1) {
        $scope.accommodations = $scope.accommodations.sort(sortByPrice);
      } else if ($scope.selectedValue.value == 2) {
        $scope.accommodations = $scope.accommodations.sort(sortByRating);
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        for(i=0 ;i<=accommodations.data.length-1;i++) {
          accommodations.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, accommodations.data[i].latitude, accommodations.data[i].longitude);
        }
        if($scope.selectedValue.value == 0){
          $scope.accommodations = $scope.accommodations.sort(sortByDistance);
        }
        for(i=0 ;i<=accommodations.data.length-1;i++) {
          if (accommodations.data[i].distance < 1)
            accommodations.data[i].distance = (accommodations.data[i].distance*1000).toFixed(0) + ' m';
          else
            accommodations.data[i].distance = accommodations.data[i].distance.toFixed(0) + ' km';
        }
      });
    })
    $ionicScrollDelegate.scrollTop(true);
  }

  $scope.loadMore = function() {
    var numLoaded = $scope.accommodations.length;
    if(numLoaded+10<$scope.allItems.length) {
      newItems = $scope.allItems.slice(numLoaded, numLoaded + 10);
      $scope.accommodations = $scope.accommodations.concat(newItems);
    } else {
      $scope.accommodations = $scope.allItems;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.updateList();

  $scope.onHold = function (accommodation) {

    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.accommodationType,accommodation.id).then(function(result) {
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        console.log(isVisited);
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.accommodationType,accommodation.id);
              } else {
                Favorite.addFavorite(itemsConfig.accommodationType,accommodation.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/accommodations/comentar/" + accommodation.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.accommodationType,accommodation.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(accommodation.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.accommodationType,accommodation.id,true);
                $scope.visitedPois.push(parseInt(accommodation.id));
              }
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

  $scope.showSortDialog = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroOrden.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

})

.controller('AccommodationCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, $sce, $cordovaNetwork,  Accommodation, ngDialog) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/accommodations'

  var accommodation_id = $stateParams.id;
  $scope.position = "info";

  Accommodation.getById(accommodation_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(accommodation) {
    $scope.accommodation = accommodation;
    if(accommodation.video && $cordovaNetwork.isOnline()) {
      $scope.video=true;
    } else {
      $scope.video=false;
      $ionicSlideBoxDelegate.update();
    }

  })

  $scope.accommodationInfo = function () {
    $location.path("tab/accommodations/" + accommodation_id);
    $scope.closeDialog();
  };

  $scope.accommodationOpinion = function () {
    $location.path("tab/accommodations/opiniones/" + accommodation_id);
    $scope.closeDialog();
  };

  $scope.accommodationMapa = function () {
    $location.path("tab/accommodations/mapa/" + accommodation_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/accommodations/comentar/" + accommodation_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-accommodation.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.accommodation.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.accommodation.phone, '_system');
  }

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/accommodations/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

/* ----- SHOPS ----- */

.controller('ShopsCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup, itemsConfig, Shop, Favorite, $window) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  Shop.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      if($scope.categories[i]!=undefined) {
        $scope.filtro.push({
          text: $scope.categories[i],
          enabled: true
        });
      }
    }
  })

  $scope.buildFilter = function() {

    $scope.filtroTipo = [];
    $scope.filtroTipo.push({'text': $translate.instant("Distancia"), 'value': 0});
    $scope.filtroTipo.push({'text': $translate.instant("Precio"), 'value': 1});
    $scope.filtroTipo.push({'text': $translate.instant("Valoracion"), 'value': 2});

  };

  $scope.buildFilter();

  $scope.updateList = function() {
    Shop.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shops){
      //$scope.shops = shops.data;

      /*$scope.allItems = shops.data;
      $scope.noMoreItemsAvailable = false;
      if($scope.allItems.length > 10) {
        $scope.shops = shops.data.slice(0,10);
        $scope.noMoreItemsAvailable = true;
      } else {
        $scope.shops = shops.data;
      }*/

      $scope.shops = shops.data;

      for(i=0 ;i<=shops.data.length-1;i++) {
        shops.data[i].visible = true;
          if($scope.filtroDisabled.enabled) {
            shops.data[i].visible = shops.data[i].disabledFriendly;
          }
          if($scope.filtroChild.enabled) {
            shops.data[i].visible = shops.data[i].childFriendly;
          }
          if(shops.data[i].visible && $scope.filtro.length) {
            var $categoria = $scope.filtro.filter(function( obj ) {
              for(var j = 0; j<shops.data[i].tags.length; j++) {
                if(obj.text == shops.data[i].tags[j])
                  return true;
              }
            });
            if($categoria.length)
              shops.data[i].visible = $categoria[0].enabled;
            else
              shops.data[i].visible = false;
          }
          shops.data[i].avgRating = $scope.poiRatings[shops.data[i].id];
      }

      if ($scope.selectedValue.value == 1) {
        $scope.shops = $scope.shops.sort(sortByPrice);
      } else if ($scope.selectedValue.value == 2) {
        $scope.shops = $scope.shops.sort(sortByRating);
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        for(i=0 ;i<=shops.data.length-1;i++) {
          shops.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, shops.data[i].latitude, shops.data[i].longitude);
          //$scope.shops = $scope.shops.sort(sortByDistance);
          if($scope.selectedValue.value == 0){
            $scope.shops = $scope.shops.sort(sortByDistance);
        }
        }
        for(i=0 ;i<=shops.data.length-1;i++) {
          if (shops.data[i].distance < 1)
            shops.data[i].distance = (shops.data[i].distance*1000).toFixed(0) + ' m';
          else
            shops.data[i].distance = shops.data[i].distance.toFixed(0) + ' km';
        }

      });
    })
  }

  $scope.loadMore = function() {
    var numLoaded = $scope.shops.length;
    if(numLoaded+10<$scope.allItems.length) {
      newItems = $scope.allItems.slice(numLoaded, numLoaded + 10);
      $scope.shops = $scope.shops.concat(newItems);
    } else {
      $scope.shops = $scope.allItems;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.updateList();

  $scope.onHold = function (shop) {

    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.shopType,shop.id).then(function(result) {
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        console.log(isVisited);
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.votar") },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.shopType,shop.id);
              } else {
                Favorite.addFavorite(itemsConfig.shopType,shop.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/shops/comentar/" + shop.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.shopType,shop.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(shop.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.shopType,shop.id,true);
                $scope.visitedPois.push(parseInt(shop.id));
              }
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

  $scope.showSortDialog = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroOrden.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

})

.controller('ShopCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, $sce, $cordovaNetwork, Shop, ngDialog) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/shops'

  var shop_id = $stateParams.id;
  $scope.position = "info";

  Shop.getById(shop_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(shop) {
    $scope.shop = shop;
    if(shop.video && $cordovaNetwork.isOnline()) {
      $scope.video=true;
    } else {
      $scope.video=false;
      $ionicSlideBoxDelegate.update();
    }

  })

  $scope.shopInfo = function () {
    $location.path("tab/shops/" + shop_id);
    $scope.closeDialog();
  };

  $scope.shopOpinion = function () {
    $location.path("tab/shops/opiniones/" + shop_id);
    $scope.closeDialog();
  };

  $scope.shopMapa = function () {
    $location.path("tab/shops/mapa/" + shop_id);
    $scope.closeDialog();
  };

  $scope.comentar = function () {
    $location.path("tab/shops/comentar/" + shop_id);
    $scope.closeDialog();
  };

  $scope.openMenu = function() {
    var dialog = ngDialog.open({ template: 'templates/menu-overlay-shop.html', disableAnimation: false});
  };

  $scope.closeDialog = function() {
    removeElementsByClass("ngdialog");
  };

  $scope.openUrl = function() {
    window.open($scope.shop.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.shop.phone, '_system');
  }

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/shops/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

/* ----- EVENTS ----- */

.controller('EventsCtrl', function($rootScope, $scope, $http, $ionicActionSheet, $translate, $cordovaGeolocation, $location, $ionicPopup, itemsConfig, Event, Favorite, $window) {

  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });
  $scope.filtro = [];

  $scope.buildFilter = function() {

    var today = new Date();
    month = today.getMonth() + 1;
    year = today.getFullYear();
    //$scope.selectedValue = {value: [month,year]};

    for(var i=0; i<10; i++) {
      newMonth = month+i;
      newYear = year;
      if(newMonth > 12) {
        newMonth -= 12;
        newYear += 1;
      }
      $scope.filtro.push({'text': $translate.instant("mes." + newMonth) + "/" + newYear, 'value': [newMonth,newYear]});
    }
  };

  $scope.buildFilter();

  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  $scope.updateList = function(month,year) {

    if (typeof(month)==='undefined') {
      var today = new Date();
      month = today.getMonth() + 1;
      year = today.getFullYear();

      Event.getNextMonth($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(events){

        /*$scope.allItems = events;
        $scope.noMoreItemsAvailable = false;
        if($scope.allItems.length > 10) {
          $scope.events = events.slice(0,10);
          $scope.noMoreItemsAvailable = true;
        } else {
          $scope.events = events;
        }*/

        $scope.events = events;

        for(i=0 ;i<=$scope.events.length-1;i++) {
          var dateStart = new Date($scope.events[i].dateStart);
            $scope.events[i].dayStart = dateStart.getDate();
            $scope.events[i].monthStart = $translate.instant("mes." + (dateStart.getMonth()+1));
        }
        //MY POSITION
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          var myLatitude  = position.coords.latitude
          var myLongitude = position.coords.longitude

          var temp = [];
          for(i=0 ;i<=$scope.events.length-1;i++) {
            $scope.events[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, $scope.events[i].latitude, $scope.events[i].longitude);
            if ($scope.events[i].distance < 1)
              $scope.events[i].distance = ($scope.events[i].distance*1000).toFixed(0) + ' m';
            else
              $scope.events[i].distance = $scope.events[i].distance.toFixed(0) + ' km';
          }
        });
        $scope.events = $scope.events.sort(sortByDate);

        function sortByDate(a,b){
          var c = a.dateStart;
          var d = b.dateStart;
          return c-d;
        }
      })
    } else {
        Event.getByMonth($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, month, year).then(function(events){

        /*$scope.allItems = events;
        $scope.noMoreItemsAvailable = false;
        if($scope.allItems.length > 10) {
          $scope.events = events.slice(0,10);
          $scope.noMoreItemsAvailable = true;
        } else {
          $scope.events = events;
        }*/

        $scope.events = events;

        for(i=0 ;i<=$scope.events.length-1;i++) {
          var dateStart = new Date($scope.events[i].dateStart);
            $scope.events[i].dayStart = dateStart.getDate();
            $scope.events[i].monthStart = $translate.instant("mes." + (dateStart.getMonth()+1));
        }
        //MY POSITION
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          var myLatitude  = position.coords.latitude
          var myLongitude = position.coords.longitude

          var temp = [];
          for(i=0 ;i<=$scope.events.length-1;i++) {
            $scope.events[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, $scope.events[i].latitude, $scope.events[i].longitude);
            if ($scope.events[i].distance < 1)
              $scope.events[i].distance = ($scope.events[i].distance*1000).toFixed(0) + ' m';
            else
              $scope.events[i].distance = $scope.events[i].distance.toFixed(0) + ' km';
          }
        });
        $scope.events = $scope.events.sort(sortByDate);

        function sortByDate(a,b){
          var c = a.dateStart;
          var d = b.dateStart;
          return c-d;
        }
      })
    }
  }

  $scope.loadMore = function() {
    var numLoaded = $scope.events.length;
    console.log(numLoaded);
    console.log($scope.allItems.length);
    if(numLoaded+10<$scope.allItems.length) {
      newItems = $scope.allItems.slice(numLoaded, numLoaded + 10);
      $scope.events = $scope.events.concat(newItems);
    } else {
      $scope.events = $scope.allItems;
      $scope.noMoreItemsAvailable = true;
    }
    $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.updateList($scope.selectedValue.value[0],$scope.selectedValue.value[1]);

  $scope.onHold = function (event) {

    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.eventType,event.id).then(function(result) {
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.votar") },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              //Mi viaje
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.eventType,event.id);
              } else {
                Favorite.addFavorite(itemsConfig.eventType,event.id);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/events/comentar/" + event.id);
              break;
            case 3:
              //Visto
              if(isVisited) {
                Favorite.addFavorite(itemsConfig.eventType,event.id,false);
                $scope.visitedPois.splice($scope.visitedPois.indexOf(parseInt(event.id)), 1);
              }
              else {
                Favorite.addFavorite(itemsConfig.eventType,event.id,true);
                $scope.visitedPois.push(parseInt(event.id));
              }
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtroDate.html',
      scope: $scope
    });

    $scope.selectDate = function() {
      $scope.updateList($scope.selectedValue.value[0],$scope.selectedValue.value[1]);
      alertPopup.close();
    }

  };

})

.controller('EventCtrl', function($rootScope, $scope, $http, $stateParams, $location, $ionicSlideBoxDelegate, $ionicHistory, $cordovaSocialSharing, $translate, Event) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/events'

  var event_id = $stateParams.id;

  Event.getById(event_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(event) {
    $scope.event = event;

    var dateStart = null;
    var dateEnd = null;
    if(event.dateStart) {
      dateStart = new Date(event.dateStart);
      $scope.event.dateStart = dateStart.getDate() + "/" + (dateStart.getMonth() + 1) + "/" + dateStart.getFullYear();
    }

    if(event.dateEnd) {
      dateEnd = new Date(event.dateEnd);
      $scope.event.dateEnd = dateEnd.getDate() + "/" + (dateEnd.getMonth() + 1) + "/" + dateEnd.getFullYear();
    }
    $ionicSlideBoxDelegate.update();

  })

  $scope.eventInfo = function () {
    $location.path("tab/events/" + event_id);
  };

  $scope.eventOpinion = function () {
    $location.path("tab/events/opiniones/" + event_id);
  };

  $scope.eventMapa = function () {
    $location.path("tab/events/mapa/" + event_id);
  };

  $scope.comentar = function () {
    $location.path("tab/events/comentar/" + event_id);
  };

  $scope.openUrl = function() {
    window.open($scope.event.url, '_system');
  };

  $scope.dialNumber = function() {
    window.open('tel:' + $scope.event.phone, '_system');
  }

  $scope.openShare = function() {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, null, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})


/* ----- RUTAS ----- */
.controller('RutasCtrl', function($rootScope, $scope, $ionicActionSheet, $translate, $cordovaGeolocation, $ionicPopup, itemsConfig, Ruta, Favorite) {
  
  $scope.$on("$ionicView.enter", function( scopes, states ) {
    $rootScope.pathMiViaje = false;
  });

  $scope.groups = [];
  $scope.rutas = [];
  $scope.ruta = null;
  $scope.filtro = [];
  $scope.filtroChild = {text: 'Familia', enabled: false};
  $scope.filtroDisabled = {text: 'Discapacitados', enabled: false};

  Ruta.getAllCategories($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(categories){
    $scope.categories = categories;
    for(var i=0; i < $scope.categories.length; i++) {
      $scope.filtro.push({
        text: $scope.categories[i],
        enabled: true
      });
    }
  })

  $scope.updateList = function() {

    Ruta.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(rutas){
      $scope.rutas = rutas.data;
      for(i=0 ;i<=rutas.data.length-1;i++) {
        rutas.data[i].visible = true;
        if($scope.filtroDisabled.enabled) {
          rutas.data[i].visible = rutas.data[i].disabledFriendly;
        }
        if($scope.filtroChild.enabled) {
          rutas.data[i].visible = rutas.data[i].childFriendly;
        }
        if(rutas.data[i].visible) {
          var $categoria = $scope.filtro.filter(function( obj ) {
            return obj.text == rutas.data[i].category;
          });
          if($categoria[0]!=undefined)
            rutas.data[i].visible = $categoria[0].enabled;
          else
            rutas.data[i].visible = true;
        }
      }

      //MY POSITION
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        var myLatitude  = position.coords.latitude
        var myLongitude = position.coords.longitude

        var temp = [];
        
        for(i=0 ;i<=rutas.data.length-1;i++) {
          rutas.data[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, rutas.data[i].routePois[0].latitude, rutas.data[i].routePois[0].longitude);
          $scope.rutas = $scope.rutas.sort(sortByDistance);
          if (rutas.data[i].distance < 1)
            rutas.data[i].distance = (rutas.data[i].distance*1000).toFixed(0) + ' m';
          else
            rutas.data[i].distance = rutas.data[i].distance.toFixed(0) + ' km';
        }
      });

    })
  }

  $scope.updateList();

  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.onHold = function (ruta) {
    var favoriteText = $translate.instant("contextMenu.miviaje");
    var visitedText = $translate.instant("contextMenu.visto");
    var isFavorite = false;
    var isVisited = false;
    Favorite.getFavorite(itemsConfig.routeType,ruta.routeId).then(function(result) {
      console.log(result[0]);
      if (result.length>0) {
        favoriteText = $translate.instant("contextMenu.miviaje.eliminar");
        isFavorite = true;
        isVisited = (result[0].visited === "true");
        console.log(isVisited);
        if(isVisited)
          visitedText = $translate.instant("contextMenu.visto.eliminar");
      }
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: favoriteText },
          { text: $translate.instant("contextMenu.votar") },
          { text: $translate.instant("contextMenu.comentar") },
          { text: visitedText }
        ],
        buttonClicked: function(index) {
          switch(index) {
            case 0:
              if(isFavorite) {
                Favorite.removeFavorite(itemsConfig.routeType,ruta.routeId);
              } else {
                Favorite.addFavorite(itemsConfig.routeType,ruta.routeId);
              }
              break;
            case 1:
              //Votar
              break;
            case 2:
              $location.path("tab/rutas/comentar/" + ruta.id);
              break;
            case 3:
              //Visto
              if(isVisited)
                Favorite.addFavorite(itemsConfig.routeType,ruta.routeId,false);
              else
                Favorite.addFavorite(itemsConfig.routeType,ruta.routeId,true);
              break;
          }
          return true;
        }
      });
    });
  }

  $scope.showFilter = function() {
    var alertPopup = $ionicPopup.show({
      templateUrl: 'templates/filtro.html',
      scope: $scope,
      buttons: [
        {
          text: $translate.instant("Aceptar"),
          type: 'button-custom',
          onTap: function(e) {
            $scope.updateList();
          }
        }
      ]
    });
  };

})

.controller('RutaCtrl', function($rootScope, $scope, Ruta, $stateParams, $location, $ionicHistory, $cordovaSocialSharing, $translate, Ruta) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/rutas'

  var route_id = $stateParams.id;
  $scope.ruta = null;

  Ruta.getById(route_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(ruta) {
    $scope.ruta = ruta;
  });

  $scope.poiInfo = function () {
    $location.path("tab/rutas/" + route_id);
  };

  $scope.poiPuntos = function () {
    $location.path("tab/rutas/pois/" + route_id);
  };

  $scope.poiOpinion = function () {
    $location.path("tab/rutas/opiniones/" + route_id);
  };

  $scope.poiMapa = function () {
    $location.path("tab/rutas/mapa/" + route_id);
  };

  $scope.comentar = function () {
    $location.path("tab/rutas/comentar/" + route_id);
  };

  $scope.startRoute = function () {
    if($scope.ruta.type==0) {
      $location.path("tab/rutas/pois/" + route_id);
    } else {
      $location.path("tab/rutas/transmedia/" + route_id);
    }
  };

  $scope.openShare = function(image) {
    $cordovaSocialSharing.share($translate.instant("poi.share"), null, $scope.fileSystem + $scope.appDirectory + $scope.appLanguage+"/routes/"+image, null);
  };

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

})

.controller('PoisRutaCtrl', function($rootScope, $scope, Ruta, $stateParams, $location, $cordovaGeolocation) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/rutas'

  var route_id = $stateParams.id;
  $scope.pois = [];

  Ruta.getPoisById(route_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pois){
    $scope.pois = pois;
    for(i=0 ;i<=pois.length-1;i++) {
      if(pois[i].type==1)
        $scope.pois[i].tipo='pois';
      else if(pois[i].type==2)
        $scope.pois[i].tipo='restaurants';
      else if(pois[i].type==3)
        $scope.pois[i].tipo='pubs';
      else if(pois[i].type==4)
        $scope.pois[i].tipo='accommodations';
      else if(pois[i].type==5)
        $scope.pois[i].tipo='shops';
    }

    //MY POSITION
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      var myLatitude  = position.coords.latitude
      var myLongitude = position.coords.longitude

      var temp = [];
      for(i=0 ;i<=pois.length-1;i++) {
        pois[i].distance = getDistanceFromLatLonInKm(myLatitude, myLongitude, pois[i].latitude, pois[i].longitude);
        if (pois[i].distance < 1)
            pois[i].distance = (pois[i].distance*1000).toFixed(0) + ' m';
          else
            pois[i].distance = pois[i].distance.toFixed(0) + ' km';
      }
    });

  });

  $scope.poiInfo = function () {
    $location.path("tab/rutas/" + route_id);
  };

  $scope.poiPuntos = function () {
    $location.path("tab/rutas/pois/" + route_id);
  };

  $scope.poiOpinion = function () {
    $location.path("tab/rutas/opiniones/" + route_id);
  };

  $scope.poiMapa = function () {
    $location.path("tab/rutas/mapa/" + route_id);
  };

  $scope.isRoute = function () {
    return true;
  }
})

.controller('TransmediaCtrl', function($rootScope, $scope, Ruta, $stateParams, $translate, $location, $cordovaGeolocation, $ionicPopup, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
  
  if($rootScope.pathMiViaje)
    $scope.backPath = "#/tab/miviaje";
  else
    $scope.backPath = '#/tab/rutas'

  var route_id = $stateParams.id;
  $scope.pois = [];
  $scope.formData = {};

  $scope.intentos = 0;
  $scope.maxReached =false;
  $scope.resolve = "";
  $scope.currentPoi = 0;
  $scope.maxPoi = 1;
  $scope.showNext = false;

  Ruta.getPoisById(route_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(pois){
    $scope.pois = pois;
    $scope.maxPoi = pois.length-1;
    for(i=0 ;i<=pois.length-1;i++) {
      if(pois[i].type==1)
        $scope.pois[i].tipo='pois';
      else if(pois[i].type==2)
        $scope.pois[i].tipo='restaurants';
      else if(pois[i].type==3)
        $scope.pois[i].tipo='pubs';
      else if(pois[i].type==4)
        $scope.pois[i].tipo='accommodations';
      else if(pois[i].type==5)
        $scope.pois[i].tipo='shops';
    }

    $scope.item = $scope.pois[0];
    $ionicScrollDelegate.scrollTop(true);
    $ionicSlideBoxDelegate.update();

  });

  $scope.poiInfo = function () {
    $location.path("tab/rutas/" + route_id);
  };

  $scope.poiOpinion = function () {
    $location.path("tab/rutas/opiniones/" + route_id);
  };

  $scope.poiMapa = function () {
    $location.path("tab/rutas/mapa/" + route_id);
  };

  $scope.alertPopup = null;
  $scope.transmediaQuestion = function () {
    $scope.alertPopup = $ionicPopup.show({
      templateUrl: 'templates/question.html',
      scope: $scope
    });
  };

  $scope.answer = function (ans) {
    if($scope.isRightAnswer(ans)) {
      $scope.userResponse = 'rightAnswer';
      $scope.showNext = true;
    } else {
      $scope.intentos++;
      if($scope.intentos>=5) {
        $scope.userResponse = 'wrongAnswer.next';
        $scope.showNext = true;
        $scope.maxReached = true;
        $scope.resolve = $scope.item.transition.answer;
        if($scope.item.transition.position==1)
          $scope.resolve = $scope.item.transition.answer;
        else if($scope.item.transition.position==2)
          $scope.resolve = $scope.item.transition.answer2;
        else if($scope.item.transition.position==3)
          $scope.resolve = $scope.item.transition.answer3;
        else if($scope.item.transition.position==4)
          $scope.resolve = $scope.item.transition.answer4;
      } else {
        $scope.maxReached = false;
        $scope.userResponse = 'wrongAnswer';
        $scope.showNext = false;
        $scope.intentos += 1;
        $scope.maxReached = false;
      }
    }
    $scope.alertPopup.close();
  };

  $scope.isRightAnswer = function (ans) {
    correctAnswer = $scope.item.transition.correctAnswer;
    if(ans == $scope.item.transition.correctAnswer) {
      return true;
    } else {
      return false;
    }
  };

  $scope.nextPoi = function () {
    $scope.currentPoi += 1;
    $scope.intentos = 0;
    $scope.maxReached = false;
    $scope.resolve = "";
    $scope.formData.answer = "";
    $scope.showNext = false;
    $scope.item = $scope.pois[$scope.currentPoi];
    $scope.userResponse = "";
    $ionicSlideBoxDelegate.update();

    if($scope.currentPoi == $scope.maxPoi) {
      $scope.lastPoi = true;
      $scope.userResponse = 'lastPoi';
    }
    $ionicScrollDelegate.scrollTop(true);

  }

})

.controller('AudioCtrl', function($scope, $state, $cordovaMedia, $stateParams, $ionicPlatform, Poi, Restaurant, Pub, Accommodation, Shop) {
  var item_id = $stateParams.id;
  var current_state = $state.current.name;

  switch(current_state) {
    case 'tab.poi':
      Poi.getAudiosById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(audioguide) {
        var tracks = getTracks($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, 'pois', audioguide);
        $scope.tracks = tracks;
        if(tracks.length>0)
          $scope.hasAudio = true;
        else
          $scope.hasAudio = false;
      });
      break;
    case 'tab.restaurant':
      Restaurant.getAudiosById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(audioguide) {
        var tracks = getTracks($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, 'restaurants', audioguide);
        $scope.tracks = tracks;
        if(tracks.length>0)
          $scope.hasAudio = true;
        else
          $scope.hasAudio = false;
      });
      break;
    case 'tab.pub':
      Pub.getAudiosById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(audioguide) {
        var tracks = getTracks($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, 'pubs', audioguide);
        $scope.tracks = tracks;
        if(tracks.length>0)
          $scope.hasAudio = true;
        else
          $scope.hasAudio = false;
      });
      break;
    case 'tab.accommodation':
      Accommodation.getAudiosById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(audioguide) {
        var tracks = getTracks($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, 'accommodations', audioguide);
        $scope.tracks = tracks;
        if(tracks.length>0)
          $scope.hasAudio = true;
        else
          $scope.hasAudio = false;
      });
      break;
    case 'tab.shop':
      Shop.getAudiosById(item_id, $scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(audioguide) {
        var tracks = getTracks($scope.fileSystem, $scope.appDirectory, $scope.appLanguage, 'shops', audioguide);
        $scope.tracks = tracks;
        if(tracks.length>0)
          $scope.hasAudio = true;
        else
          $scope.hasAudio = false;
      });
      break;
  }

  $scope.play = function(src) {
    var media = $cordovaMedia.newMedia(src);
    media.play();
  }
})

.controller('InformacionCtrl', function($scope, $ionicSlideBoxDelegate, Info) {
  Info.getAll($scope.fileSystem, $scope.appDirectory, $scope.appLanguage).then(function(infos){
    $scope.images = infos.data[0].photosApp;
    $scope.infos = infos.data[0].sectionInfos;
    $ionicSlideBoxDelegate.update();
  });

  $scope.toggleInfo = function(info) {
    if ($scope.isInfoShown(info)) {
      $scope.shownInfo = null;
    } else {
      $scope.shownInfo = info;
    }
  };
  $scope.isInfoShown = function(info) {
    return $scope.shownInfo === info;
  };

})

//SETTINGS
.controller('SettingsCtrl', function($scope) {
  $scope.activeMenu = 'config';
})

.controller('ContentCtrl', function($scope) {
  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})


//INTERNATIONALIZATION

.controller('TranslateCtrl', function($rootScope, $scope, $translate, $location, DB, pathConfig, itemsConfig, $window) {
  var queryInsert = "";
  $scope.changeLanguage = function (langKey) {
    var lang = $translate.instant(langKey);
    var fileName= lang+".zip";
    var server = pathConfig.origin+$rootScope.idOrganization+'/'+$rootScope.idDestination+'/';
    var version = pathConfig.version;
    var appDirect = pathConfig.appDirectory;
    queryInsert= 'INSERT INTO configuration (server_url, app_Lang, fileName, version, app_directory) VALUES("'+server+'","'+lang+'","'+fileName+'","'+version+'","'+appDirect+'")';
    DB.insert(queryInsert);

    $scope.appLanguage = lang;
    $scope.appDirectory = appDirect;
    $scope.versionApp = version;

    $translate.use(langKey);
    $location.path( "tab/guia" );

  };

})
