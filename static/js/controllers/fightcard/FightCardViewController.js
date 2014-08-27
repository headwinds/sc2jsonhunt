angular.module('metamatch.controllers').controller('FightCardViewController', 
	['$rootScope', '$scope', '$window', 'PlayerModel', '$timeout', function ($rootScope, $scope, $window, PlayerModel, $timeout) {
		
		////////////////////////////////////////////// VARIABLES 
		var bLog = true;

		$scope.bShowApp = true; 
		$scope.selectedMatch = null;

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

		$scope.selectedMatch = match0; // for now, there is only 1 match

		$scope.selectedMatch.details = "You will be playing as " + $scope.selectedMatch.player1.proName + " vs " + $scope.selectedMatch.player2.proName;

		$scope.matches = [match0, match1, match2]; 

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("FightCardViewController - init");

			$timeout( function(){
				$scope.$broadcast("fightcard:players", $scope.matches)
			}, 500);

			setupEvents();

		}

		////////////////////////////////////////////// EVENTS

		var setupEvents = function(){
			$scope.$on("player:ready", onPlayerReadyHandler);
			$scope.$on("player:selected", onPlayerSelectedHandler);
		}
		
		$scope.onMatchGoClickHandler = function(){

			if (bLog) console.log("FightCardViewController - onMatchGoClickHandler ");

			$scope.bShowApp = false;
			$rootScope.$broadcast("fightcard:go", $scope.selectedMatch); 
		}

		var onPlayerReadyHandler = function(event, data){
			if (bLog) console.log("FightCardViewController - onPlayerReadyHandler - data.proName: " + data.proName);
		}

		var onPlayerSelectedHandler = function(event, data){

			if (bLog) console.log(data, "FightCardViewController - onPlayerSelectedHandler - data.proName: " + data.proName);

			var selectedPlayerProName = data.proName; 

			var opponentProName = ( selectedPlayerProName === $scope.selectedMatch.player1.proName ) ? $scope.selectedMatch.player2.proName :  $scope.selectedMatch.player1.proName;

			$scope.selectedMatch.details = "You will be playing as " + selectedPlayerProName + " vs " + opponentProName;

		}

		
   
}]);