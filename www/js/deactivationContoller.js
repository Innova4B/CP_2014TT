angular.module('starter.deactivationController', [])
.controller('deactvController', function($scope,$location) {
	alert($location.path());
	
	$scope.$on('$ionicView.loaded', function () {
		if($location.path()== '/deactivated'){
			alert("deactivated");
			//$ionicHistory.clearCache();
    		$ionicHistory.clearHistory();
    	}
	  });


	

})