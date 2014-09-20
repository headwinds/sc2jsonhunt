angular.module('metamatch.controllers').controller('PlayerViewController', 
	['$rootScope', '$scope', '$window', '$timeout', function ($rootScope, $scope, $window, $timeout) {

		////////////////////////////////////////////// VARIABLES 

		$scope.bShowApp = true; 
		$scope.player = null;
		$scope.proName = null;
		$scope.player = {};

		var bLog = true;

		////////////////////////////////////////////// EVENTS 

		

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			
			$timeout( function(){
				if (bLog) console.log($scope.playermodel, "PlayerViewController - init - $scope");

				$scope.proName = $scope.playermodel.proName;	
				$scope.$on("fightcard:players", onPlayerDataReadyHandler );	
				$scope.$emit("player:ready", { proName: $scope.proName});

				$scope.playerClass = "progamers-" + $scope.proName;


			}); 

		}

		////////////////////////////////////////////// HANDLERS 

		var onPlayerDataReadyHandler = function(event, data){
			if (bLog) console.log(data, "PlayerViewController - onPlayerDataReadyHandler - data");

			//var matches = data.targetScope.matches; // alternative...
			//if (bLog) console.log(matches, "PlayerViewController - onPlayerDataReadyHandler - matches");

			var match0 = data[0]; 

			_.each(match0, function(player) {
				if (player.proName === $scope.proName) $scope.player = player;
			});

			if (bLog) console.log($scope.player, "PlayerViewController - onPlayerDataReadyHandler - event");
		}

		$scope.playerSelectClickHandler = function( proName ) {
			if (bLog) console.log("PlayerViewController - playerSelectClickHandler - playerName: " + proName);

			// getModelByName 
			// $rootScope.getPlayerModelByProName( playerName );

			var proNameLowerCase = proName.toLowerCase();

			var selectedPlayerModel = $rootScope.getPlayerModelByProName( proNameLowerCase );

			$rootScope.$broadcast("player:selected", { proName: proNameLowerCase, proNameCase: proName });
		}

		
   
}]);