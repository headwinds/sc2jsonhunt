angular.module('metamatch.controllers').controller('PlayerViewController', 
	['$scope', '$window', function ($scope, $window) {

		////////////////////////////////////////////// VARIABLES 

		$scope.bShowApp = true; 
		$scope.player = null;
		$scope.proName = null;
		$scope.player = {};

		var bLog = true;

		////////////////////////////////////////////// EVENTS 

		

		////////////////////////////////////////////// INIT 

		$scope.init = function( proNameStr ){
			if (bLog) console.log($scope, "PlayerViewController - init - proNameStr: " + proNameStr);

			$scope.proName = proNameStr;

			$scope.$on("fightcard:players", onPlayerDataReadyHandler );

			$scope.$emit("player:ready", { proName: $scope.proName});

			

		}

		////////////////////////////////////////////// HANDLERS 

		var onPlayerDataReadyHandler = function(event, data){
			//if (bLog) console.log(arguments, "PlayerViewController - onPlayerDataReadyHandler - event");

			//var matches = data.targetScope.matches; // alternative...
			//if (bLog) console.log(matches, "PlayerViewController - onPlayerDataReadyHandler - matches");

			var match0 = data[0]; 

			_.each(match0, function(player) {
				if (player.proName === $scope.proName) $scope.player = player;
			});

			if (bLog) console.log($scope.player, "PlayerViewController - onPlayerDataReadyHandler - event");
		}

		$scope.onPlayerSelect = function( playerName ) {
			if (bLog) console.log("PlayerViewController - onPlayerSelect - playerName: " + playerName);

			$scope.$emit("player:selected", { proName: playerName});
		}

		
   
}]);