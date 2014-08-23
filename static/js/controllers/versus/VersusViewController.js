angular.module('metamatch.controllers').controller('VersusViewController', 
	['$rootScope', '$scope', '$window', function ($rootScope, $scope, $window) {

		////////////////////////////////////////////// VARIABLES
		var bLog = true;

		$scope.bShowApp = false; 
		$scope.selectedMatch = null;
		$scope.versus = {
			time: new Date().getTime() 
		}
		$scope.selectedMatch = null;

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("VersusViewController - init");

			setupEvents();
		}

		////////////////////////////////////////////// EVENTS

		var setupEvents = function(){
			$rootScope.$on("fightcard:go", onFightCardGoHandler)
		}

		////////////////////////////////////////////// HANDLERS

		var onFightCardGoHandler = function(event, data) {

			if (bLog) console.log(data, "VersusViewController - onFightCardGoHandler ");

			$scope.selectedMatch = data;

			$scope.bShowApp = true;

		}
   
}]);