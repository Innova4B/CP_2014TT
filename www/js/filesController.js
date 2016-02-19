angular.module('starter.filesController', [])

//FILES CONTROL
.controller('FilesCtrl', function($rootScope, $scope, $window, $location, $http, $ionicLoading, $ionicPopup, $translate, $q, getFile, pathConfig, DB, SocialComment, itemsConfig, Destination, Organization) {
  
  $scope.fileName = "";
  $scope.appLang= "";
  $scope.downloadMaps= -1;
  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    //Android and iOS
      document.addEventListener("deviceready", onDeviceReady, true);   
  } else {
    //Web browser
    $location.path( "/home-destination" );
  }

  function runningWebBrowser(){
    console.log("Web browser");
  }

  //For android/iOS
  function onDeviceReady() {
    console.log('Device is ready');
    $scope.deviceReady = true;
    window.requestFileSystem(PERSISTENT,20*1024*1024, checkStatus, koRequestFileSystem);
  }

  function checkStatus(fileSystem) {
    //alert('checkStatus');
    $scope.fileSystem = fileSystem;
    console.log('checkStatus');
    var appDirectory = pathConfig.appDirectory;
    var version=pathConfig.version;
    var networkState = navigator.connection.type;
    getFile.setVariables(fileSystem);

    
    fileSystem.root.getDirectory(appDirectory, 
        {create: false}, 
        function onGetDirectoryWin(){
          console.log('Data OK');
        }, 
        function onGetDirectoryFail(){
          alert("No data");
        }
    );
  };

  function koRequestFileSystem(){
    alert("The file system of your phone does not respond");
  }
  console.log('FilesCtrl is loaded');
})