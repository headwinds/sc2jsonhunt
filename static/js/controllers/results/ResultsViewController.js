angular.module('metamatch.controllers').controller('ResultsViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.bShowApp = false; 
		var bLog = false;

		$scope.init = function(){
			if (bLog) console.log("ResultsViewController - init");
		}
   
}]);