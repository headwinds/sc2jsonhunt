angular.module('photohunt').controller('FightCardViewController', 
	['$scope', '$window', 'PlayerModel', '$timeout', function ($scope, $window, PlayerModel, $timeout) {
		
		////////////////////////////////////////////// VARIABLES 
		
		$scope.bShowApp = true; 
		var bLog = false;

		$scope.fightcard = {
			what: "this is the fight card"
		}

		var fenner = new PlayerModel("fenner", "images/players/fenner/fennerPortrait.png"); 
		var pet = new PlayerModel("petraeus", "images/players/petraeus/petraeusPortrait.png"); 

		var match0 = {
			player1: fenner,
			player2: pet
		}

		var match1 = {
			player1: fenner,
			player2: pet
		}

		var match2 = {
			player1: fenner,
			player2: pet
		}

		$scope.matches = [match0, match1, match2]; 

		////////////////////////////////////////////// EVENTS

		$scope.$on("player:ready", onPlayerReadyHandler);  

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("FightCardViewController - init");

			$timeout( function(){
				$scope.$broadcast("fightcard:players", $scope.matches)
			}, 500);
		}
		

		var onPlayerReadyHandler = function(data){
			if (bLog) console.log("FightCardViewController - onPlayerReadyHandler - data.proName: " + data.proName);
		}
   
}]);