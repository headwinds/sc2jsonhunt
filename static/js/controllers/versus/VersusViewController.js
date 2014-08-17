angular.module('photohunt').controller('VersusViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.bShowApp = false; 

		$scope.init = function(){
			console.log("VersusViewController - init");
		}
   
}]);