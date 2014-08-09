angular.module('photohunt').controller('FightCardViewController', 
	['$scope', '$window', function ($scope, $window) {

		$scope.fightcard = {
			what: "this is the fight card"
		}

		$scope.init = function(){
			console.log("FightCardViewController - init");
		}
   
}]);