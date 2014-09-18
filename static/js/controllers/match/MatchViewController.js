angular.module('metamatch.controllers').controller('MatchViewController', 
	['$rootScope', '$scope', '$window', '$timeout',  function ($rootScope, $scope, $window, $timeout) {

		////////////////////////////////////////////// VARIABLES 

	

		var bLog = true;

		////////////////////////////////////////////// EVENTS 

		$scope.match = null;

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
		
			$timeout( function(){
				if (bLog) console.log($scope.matchmodel, "MatchViewController - init - $scope");
			}); 

		}

		////////////////////////////////////////////// HANDLERS 

		var onDataReadyHandler = function(event, data){
			
		}

		$scope.buttonClick = function( dataStr ) {
			
		}

		
   
}]);