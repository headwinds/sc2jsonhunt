angular.module('metamatch.controllers').controller('MetaMatchViewController', 
	['$rootScope', '$scope', '$window', function ($rootScope, $scope, $window) {

		////////////////////////////////////////////// VARIABLES

		$scope.bShowApp = true; 
		var bLog = true;

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("MetaMatchViewController - init");

			setupEvents();
		}

		////////////////////////////////////////////// EVENTS

		var setupEvents = function(){
			//$rootScope.$on("fightcard:go", onFightCardGoHandler);
		}

		////////////////////////////////////////////// HANDLERS

		var onFightCardGoHandler = function(event, data) {

			if (bLog) console.log("MetaMatchViewController - onFightCardGoHandler");

		}
   
}]);