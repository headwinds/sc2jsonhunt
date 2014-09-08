angular.module('metamatch.controllers').controller('FightCardViewController', 
	['$rootScope', '$scope', '$window', 'PlayerModel', '$timeout', function ($rootScope, $scope, $window, PlayerModel, $timeout) {
		
		////////////////////////////////////////////// VARIABLES 
		var bLog = true;

		$scope.bShowApp = true; 
		$scope.selectedMatch = null;

		$scope.fightcard = {
			what: "this is the fight card"
		}
		///////////////////////////////////////////////////////////////////////////////

		var fenner = new PlayerModel("Fenner", "images/players/fenner/fennerPortrait.png", 1); 
		var pet = new PlayerModel("KiseRyota", "images/players/kiseryota/kiseryotaPortrait.png", 2); 
		var players = [ fenner, pet ];

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

		///////////////////////////////////////////////////////////////////////////////

		$scope.selectedMatch = match0; // for now, there is only 1 match

		$scope.matches = [match0, match1, match2]; 
		
		$scope.selectedPlayer = null;
		$scope.selectedPlayerProName = "unknown"; 

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("FightCardViewController - init");

			$timeout( function(){
				$scope.$broadcast("fightcard:players", $scope.matches);

				// broadcast the default match
				$scope.selectedPlayerProName = $scope.selectedMatch.player1.proName;
				selectPlayer(); 

				$scope.selectedMatch.details = "You will be playing as " + $scope.selectedMatch.player1.proNameCase + " vs " + $scope.selectedMatch.player2.proNameCase;

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

			$scope.selectedPlayer = $rootScope.getPlayerModelByProName(data.proName); // not quite all the details - need to look up the model!
			$scope.selectedPlayerProName = data.proName; 

			if (bLog) console.log($scope.selectedPlayer, "FightCardViewController - onPlayerSelectedHandler - player model lookup");

			selectPlayer(); 
		}

	
		////////////////////////////////////////////// FUNCTIONS

		/*
		getPlayerModelByProName = function( proName ) {

			if (bLog) console.log("FightCardViewController - getPlayerModelByProName - proName: " + proName);
			
			_.each( players, function(player){
				if ( player.proName === proName ) return player; 
			})
		}
		*/


		$rootScope.getPlayerModelByProName = function( proName ) {

			if (bLog) console.log("FightCardViewController - getPlayerModelByProName - proName: " + proName);
		
			var foundPlayer = {}

			_.each( players, function(player){
				if ( player.proName.toLowerCase() === proName ) foundPlayer = player; 
			})

			return foundPlayer; 
		}

		var selectPlayer = function(){

			if (bLog) console.log("FightCardViewController - selectPlayer - selectedPlayerProName: " + $scope.selectedPlayerProName);


			$scope.selectedPlayer = $rootScope.getPlayerModelByProName( $scope.selectedPlayerProName.toLowerCase() ); 

			// details
			var opponentProName = ( $scope.selectedPlayerProName === $scope.selectedMatch.player1.proName ) ? $scope.selectedMatch.player2.proNameCase :  $scope.selectedMatch.player1.proNameCase;
			var selectedPlayerId  = ( $scope.selectedPlayerProName === $scope.selectedMatch.player1.proName ) ? "player1" : "player2";

			$scope.selectedMatch.details = "You will be playing as " + $scope.selectedPlayer.proNameCase + " vs " + opponentProName;

			// broadcast
			var broadcastData = {proName: $scope.selectedPlayerProName, playerId: selectedPlayerId, match: $scope.selectedMatch };
			console.log(broadcastData, "FightCardViewController - selectPlayer - broadcastData");
			$rootScope.$broadcast("fightcard:match:selected", broadcastData)

		}
		
		$scope.matchGoClickHandler = function(){

			if (bLog) console.log("FightCardViewController - onMatchGoClickHandler ");

			$scope.bShowApp = false;

			// who was selected?! 
			
			selectPlayer(); 

			$rootScope.$broadcast("fightcard:go", $scope.selectedMatch); 
		}

		

		
   
}]);