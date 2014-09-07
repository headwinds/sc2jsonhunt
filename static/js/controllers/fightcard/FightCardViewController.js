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
		
		$scope.matches = [match0, match1, match2]; 

		$scope.selectedPlayerProName = "unknown"; 

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("FightCardViewController - init");

			$timeout( function(){
				$scope.$broadcast("fightcard:players", $scope.matches);

				// broadcast the default match
				$scope.selectedPlayerProName = $scope.selectedMatch.player1.proName;
				selectPlayer(); 

				$scope.selectedMatch.details = "You will be playing as " + $scope.selectedMatch.player1.proName + " vs " + $scope.selectedMatch.player2.proName;

			}, 500);

			
			setupEvents();

		}

		////////////////////////////////////////////// EVENTS

		var setupEvents = function(){
			$scope.$on("player:ready", onPlayerReadyHandler);
			$rootScope.$on("player:selected", onPlayerSelectedHandler);
		}

		////////////////////////////////////////////// HANDLERS

		var onPlayerReadyHandler = function(event, data){
			if (bLog) console.log("FightCardViewController - onPlayerReadyHandler - data.proName: " + data.proName);
		}

		var onPlayerSelectedHandler = function(event, data){
			if (bLog) console.log(data, "FightCardViewController - onPlayerSelectedHandler - data.proName: " + data.proName);

			$scope.selectedPlayerProName = data.proName; 

			selectPlayer(); 
		}

	
		////////////////////////////////////////////// FUNCTIONS

		var selectPlayer = function(){

			if (bLog) console.log("FightCardViewController - selectPlayer - selectedPlayerProName: " + $scope.selectedPlayerProName);

			// details
			var opponentProName = ( $scope.selectedPlayerProName === $scope.selectedMatch.player1.proName ) ? $scope.selectedMatch.player2.proName :  $scope.selectedMatch.player1.proName;
			var selectedPlayerId  = ( $scope.selectedPlayerProName === $scope.selectedMatch.player1.proName ) ? "player1" : "player2";

			$scope.selectedMatch.details = "You will be playing as " + $scope.selectedPlayerProName + " vs " + opponentProName;

			
			// broadcast
			var broadcastData = {proName: $scope.selectedPlayerProName, playerId: selectedPlayerId, match: $scope.selectedMatch };
			console.log(broadcastData, "FightCardViewController - selectPlayer - broadcastData");
			$rootScope.$broadcast("fightcard:match:selected", broadcastData)

		}
		
		$scope.matchGoClickHandler = function(){

			if (bLog) console.log("FightCardViewController - onMatchGoClickHandler ");

			$scope.bShowApp = false;

			// who was selected?! 
			
			selectPlayer( $scope.selectedProName ); 

			$rootScope.$broadcast("fightcard:go", $scope.selectedMatch); 
		}

		

		
   
}]);