angular.module("starter.directives", [])

.directive("rating-readonly", function() {
  var directive = { };
  directive.restrict = 'AE';
  
  directive.scope = {
    score: '=score',
    max: '=max',
    readonly: '=readonly'
  };

  directive.templateUrl = "templates/rating.html";
  
  directive.link = function(scope, elements, attr) {
    
    scope.updateStars = function() {
      var idx = 0;
      scope.stars = [ ];
      for (idx = 0; idx < scope.max; idx += 1) {
        scope.stars.push({
          full: scope.score > idx
        });
      }
    };
    
    scope.hover = function(/** Integer */ idx) {
      scope.hoverIdx = idx;
    };
    
    scope.stopHover = function() {
      scope.hoverIdx = -1;
    };
    
    scope.starColor = function(/** Integer */ idx) {
      var starClass = 'rating-normal';
      if (idx <= scope.hoverIdx) {
       starClass = 'rating-highlight'; 
      }
      return starClass;
    };
    
    scope.starClass = function(/** Star */ star, /** Integer */ idx) {
      var starClass = 'ion-android-star-outline';
      if (star.full || idx <= scope.hoverIdx) {
        starClass = 'ion-android-star';
      }
      return starClass;
    };
    
    scope.setRating = function(idx) {
      scope.score = idx + 1;
      scope.stopHover();
    };
    
    scope.$watch('score', function(newValue, oldValue) {
      if (newValue !== null && newValue !== undefined) {
        scope.updateStars();
      }
    });
  };
  
  return directive;
})

  angular.module('starter.directives').directive('orientable', function () {       
    return {
        link: function(scope, element, attrs) {   

            element.bind("load" , function(e){ 

                console.log(window.innerWidth);

                if(this.naturalWidth/this.naturalHeight < window.innerWidth/230){
                  console.log("vertical");
                  this.className += " vertical";
                } else {
                  console.log("horizontal");
                  this.className += " horizontal";
                }
            });
        }
    }
});