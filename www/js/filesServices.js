angular.module('starter.filesServices', ['starter.config','starter.filesConfig'])


//Json FILES
.factory('getFile', function($http, pathConfig, itemsConfig, $ionicLoading, $q) {
  var self = this;
  self.toUpdate = 0;
  self.appDirectory=pathConfig.appDirectory;

  self.origin=pathConfig.origin+itemsConfig.idOrganization+'/'+itemsConfig.idDestination+'/';
  self.fileName="";
  self.appLang="";
  self.fileSystem="";
  self.deviceRoot="";

  self.setVariables= function(fileSystem){
    self.fileSystem=fileSystem;
    self.versionDirectory = self.appDirectory+"currentVersion/";
    self.deviceRoot = fileSystem.root.toURL();
  };

  self.getKey = function(){
    var generatedKey = pathConfig.Key;
    return (generatedKey);
  }


  return self;
});