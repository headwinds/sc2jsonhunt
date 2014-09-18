angular.module('metamatch.controllers').controller('VersusViewController', 
	['$rootScope', 
	'$scope', 
	'$window', 
	'$timeout',
	'NumberUtilFactory', 
	function (	$rootScope, 
				$scope,
				$window,
				$timeout,
				NumberUtilFactory) {

		////////////////////////////////////////////// VARIABLES
		var bLog = true;

		$scope.bShowApp = false; 
		$scope.selectedMatch = null;

		var NumberUtilFactory = new NumberUtilFactory();

		$scope.versus = {
			time: "0:00",
			score: 0
		}

		$scope.versusHeader = {
			time:  "0:00",
			score: 0 
		}


		$scope.optionClickHandler = function(  ){
		
			console.log("VersusViewController - optionClickHandler");
			//compareOptionActual(abilityNameStr, currrentFrameDataObj.ability_name)
		}


		

		$scope.selectedMatch = null;

		////////////////////////////////////////////// INIT 

		$scope.init = function(){
			if (bLog) console.log("VersusViewController - init");

			setupEvents();
		}

		////////////////////////////////////////////// EVENTS

		var setupEvents = function(){
			$rootScope.$on("fightcard:go", onFightCardGoHandler);
			$rootScope.$on("replay:update", onReplayUpdateHandler);
			$rootScope.$on("player:score", onPlayerScoreHandler);
			$rootScope.$on("player:time", onPlayerFrameAdvanceHandler);		
		}

		////////////////////////////////////////////// HANDLERS

		var onPlayerFrameAdvanceHandler  = function(event,data) {
			if (bLog) console.log(data, "VersusViewController - onPlayerFrameAdvanceHandler ");
			
			var displayTime = NumberUtilFactory.convertTime( data.gameObj ); 

			$scope.versusHeader.time = displayTime;
		}

		var onPlayerScoreHandler = function(event,data) {
			if (bLog) console.log(data, "VersusViewController - onPlayerScoreHandler ");
			$scope.versusHeader.score = data.score;
		}

		var onFightCardGoHandler = function(event, data) {

			if (bLog) console.log(data, "VersusViewController - onFightCardGoHandler ");

			$timeout( function(){
             $scope.selectedMatch = data;
            }); 
			
			$scope.bShowApp = true;

		}

		var onReplayUpdateHandler  = function(event, data) {
			if (bLog) console.log(data, "VersusViewController - onReplayUpdateHandler ");
			$timeout( function(){
             $scope.versus.time = data.time;
            }); 
		}
   
}]);