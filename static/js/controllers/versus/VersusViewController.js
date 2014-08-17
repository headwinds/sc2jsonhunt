angular.module('photohunt').controller('VersusViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.bShowApp = false; 
		var bLog = false;

		$scope.init = function(){
			if (bLog) console.log("VersusViewController - init");
		}
   
}]);