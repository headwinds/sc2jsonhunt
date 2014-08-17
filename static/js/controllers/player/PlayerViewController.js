angular.module('photohunt').controller('PlayerViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.bShowApp = true; 

		$scope.init = function(){
			console.log("PlayerViewController - init");
		}
   
}]);