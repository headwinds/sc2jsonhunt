angular.module('photohunt').controller('FightCardViewController', 
	['$scope', '$window', 'PlayerModel', function ($scope, $window, PlayerModel) {

		$scope.bShowApp = true; 

		$scope.fightcard = {
			what: "this is the fight card"
		}

		var fenner = new PlayerModel("fenner", "images/players/fenner/fennerPortait.png"); 
		var pet = new PlayerModel("petraeous", "images/players/petraeous/petraeousPortait.png"); 

		var match0 = {
			player1: fenner,
			player2: pet
		}

		$scope.matches = [match0, match1, match2]; 

		$scope.init = function(){
			console.log("FightCardViewController - init");
		}
   
}]);