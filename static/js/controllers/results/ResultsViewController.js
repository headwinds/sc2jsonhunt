angular.module('photohunt').controller('ResultsViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.bShowApp = false; 

		$scope.init = function(){
			console.log("ResultsViewController - init");
		}
   
}]);