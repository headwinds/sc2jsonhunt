/*

	see arcade - "Unit_Test_Map"

*/

angular.module('metamatch.controllers').controller('ReplayViewController', 
	['$rootScope', 
	'$scope', 
	'$location', 
	'ConfigureFactory', 
	'ReplayHuntApiFactory',
	'NumberUtilFactory', 
	'$timeout', 
	'$window', 
	'$compile',
	'$filter',
	function ($rootScope, 
		$scope, 
		$location, 
		ConfigureFactory, 
		ReplayHuntApiFactory, 
		NumberUtilFactory,
		$timeout, 
		$window,
		$compile,
		$filter) {

	////////////////////////////////////////////// VARIABLES	

	$scope.bPreloaderMessage = true;
	$scope.bShowApp = false; 	
	var bLog = true;

	var NumberUtilFactory = new NumberUtilFactory();

	var replayDataObj = null;
	var replayData = [];
	
	$scope.player1Events = [];
	$scope.player2Events = [];
	
	var replayDataIndex = 0; 

	var currrentFrameDataObj = {};

	$scope.versus = {
		time: "0:00",
		score: 0
	}

	//var selectedPlayer = "player1";
	$scope.playerSelectedName = "unknown"; // this controller may be ready for to hear this event?!
	$scope.playerSelectedId = "unknown";
	$scope.selectedMatch = {};

	////////////////////////////////////////////// INIT
	
	$scope.init = function(){
		if (bLog) console.log("ReplayViewController - init" );

		setupEvents();

	
	}

	////////////////////////////////////////////// EVENTS

	var setupEvents = function(){
		$rootScope.$on("fightcard:go", onFightCardGoHandler);		
		$rootScope.$on("fightcard:match:selected", onMatchSelectedHandler); 
	}

	////////////////////////////////////////////// HANDLERS

	var onMatchSelectedHandler = function(event, data) {

		if (bLog) console.log(data, "ReplayViewController - onMatchSelectedHandler");

		$scope.playerSelectedName = data.proName; 
		$scope.playerSelectedId = data.playerId;
		$scope.selectedMatch = data.match;

	}

	var onFightCardGoHandler = function(event, data) {

		if (bLog) console.log("ReplayViewController - onFightCardGoHandler");

		$scope.getReplay();
		$scope.bShowApp = true; 

	}

	////////////////////////////////////////////// SERVICES

	$scope.getGraphicByAbility = function( abilityStr ){

		var race = "zerg";
		var imgPath = "images/" + race + "/units/"; 

		//var unitNameTest = abilityStr.toLowerCase().split("morph")[1];

		console.log("ReplayViewController - getGraphicByAbility - abilityStr: " + abilityStr )

		var unitName; 

		if ( abilityStr.toLowerCase().indexOf("morph") > -1 ) {
			unitName = abilityStr.toLowerCase().split("morph")[1] + ".png";
		}


		if ( abilityStr.toLowerCase().indexOf("morphto") > -1 ) {
			unitName = abilityStr.toLowerCase().split("morphto")[1] + ".png";
		}

		if ( abilityStr.toLowerCase().indexOf("cancel") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			unitName = "cancelbuilding.png";
		}

		if ( abilityStr.toLowerCase().indexOf("spawn") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			//unitName = "queen.png";
			unitName = abilityStr.toLowerCase().split("spawn")[1] + ".png";
		}

		if ( abilityStr.toLowerCase().indexOf("train") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			//unitName = "queen.png";
			unitName = abilityStr.toLowerCase().split("train")[1] + ".png";
		}

		if ( abilityStr.toLowerCase().indexOf("queen") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			unitName = "queen.png";
			//unitName = abilityStr.toLowerCase().split("train")[1] + ".png";
		}

		if ( abilityStr.toLowerCase() === "returncargo" ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			unitName = "returncargo.png";
			//unitName = abilityStr.toLowerCase().split("train")[1] + ".png";
		}

		if ( abilityStr.toLowerCase() === "holdposition" ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			unitName = "holdposition.png";
			//unitName = abilityStr.toLowerCase().split("train")[1] + ".png";
		}

		//

		if ( abilityStr.toLowerCase().indexOf("evolve") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			//unitName = "metabolicboost.png";
			unitName = abilityStr.toLowerCase().split("evolve")[1] + ".png";
		}

		if ( abilityStr.toLowerCase().indexOf("upgradeto") > -1 ) {
			//unitName = abilityStr.toLowerCase().split("cancel")[1] + ".png";
			//unitName = "metabolicboost.png";
			unitName = abilityStr.toLowerCase().split("upgradeto")[1] + ".png";
		}

		 
		//EvolveMetabolicBoost

		// ReturnCargo

		console.log("ReplayViewController - getGraphicByAbility - unitName: " + unitName )

		//SpawnChangeling
		
		/*



		switch( abilityStr ) {
			case "MorphDrone" :
				unitName = "drone.png";
				break;
			default :
				unitName = "drone.png";
				break;

		}
		*/

		var unitPath = imgPath + unitName;
		var graphicHtml = "<img src=" + unitPath + " />"

		return graphicHtml;
	}

	var convertTime = function(gameObj){
		  
	    return NumberUtilFactory.convertTime(gameObj);
	}

	$scope.optionClickHandler = function( gameObj ){
		
		console.log(currrentFrameDataObj, "ReplayViewController - optionClickHandler");
		
		compareOptionActual(gameObj.ability_name, currrentFrameDataObj.ability_name);
		displayNextEvent();
	}

	var scorePoint = function(){

		var scorePts = 10; 
		$scope.versus.score += scorePts;

		console.log("ReplayViewController - scorePoint - current score: " + $scope.versus.score);

		$rootScope.$broadcast("player:score", { score: $scope.versus.score } ); 
		$rootScope.$broadcast("player:time", { gameObj: currrentFrameDataObj } ); 
	}

	var compareOptionActual = function( optionAbilityNameStr, actualAbilityNameStr ) {

	
		if ( optionAbilityNameStr === actualAbilityNameStr ) {
			scorePoint();
		}

	}

	var getPlayerClass = function(playerId, gameObj){

		var playerName = gameObj[playerId]; //gameObj[playerId].split(" ")[4];

		console.log(playerName, "ReplayViewController - getPlayerClass - playerName");
		console.log($scope.playerSelectedName, "ReplayViewController - getPlayerClass - $scope.playerSelectedName");

		 if ( playerName.toLowerCase() === $scope.playerSelectedName.toLowerCase() ) return 'playerEnabled';
		 else return 'playerDisabled';
	
	}

	var setCurrentFrameData = function( playerId, gameObj ){
		// only need to know the selected player's event data
		var playerName = gameObj[playerId]; //gameObj[playerId].split(" ")[4];
		
		console.log(playerName.toLowerCase(), "ReplayViewController - setCurrentFrameData - playerName.toLowerCase()");
		console.log($scope.playerSelectedName.toLowerCase(), "ReplayViewController - setCurrentFrameData - $scope.playerSelectedName.toLowerCase()");

		if ( playerName.toLowerCase() === $scope.playerSelectedName.toLowerCase() ) currrentFrameDataObj = gameObj;
	}

	var displayReplayEvent = function( playerId, gameObj ){
		console.log(arguments, "ReplayViewController - displayReplayEvent");

		//$timeout( function(){
		var playerResultHtml;
		//var playerClass = getPlayerClass(playerId, gameObj);

		setCurrentFrameData(playerId, gameObj); 

		 if ( playerId === "player1" ) {
		 	$scope.curPlayer1EventModel = gameObj;
		 	$scope.curPlayer1EventModel.playedClass = getPlayerClass(playerId, gameObj);
		 	playerResultHtml = "<div class='playerEventOption " + $scope.curPlayer1EventModel.playedClass + "' ng-click='optionClickHandler(curPlayer1EventModel)' ng-model='curPlayer1EventModel' data-ability-name='" + gameObj.ability_name.trim() + "'>" 
		 } else { 
		 	$scope.curPlayer2EventModel = gameObj;
		 	$scope.curPlayer2EventModel.playedClass = getPlayerClass(playerId, gameObj);
		 	playerResultHtml = "<div class='playerEventOption " + $scope.curPlayer2EventModel.playedClass + "' ng-click='optionClickHandler(curPlayer2EventModel)' ng-model='curPlayer2EventModel' data-ability-name='" + gameObj.ability_name.trim() + "'>" 
		 }

		 // which player are you?

		playerResultHtml += $scope.getGraphicByAbility( gameObj.ability_name.trim() );
		playerResultHtml += "</div>";

	    var compiledElement = $compile( playerResultHtml )( $scope );

	    $("#" + playerId).html( compiledElement );

	}

	var removeReplayEvents = function(){

		if ( $("#player1 div").hasClass("playerEnbbled") ) $("#player1 div").off();
		else $("#player2 div").off();

		$("#player1").empty();
		$("#player2").empty();
	}

	var displayEndEvent = function(playerId){
		var endHTML;
		//var playerClass = getPlayerClass(playerId, gameObj);
		endHTML = "<div><p>no more events</p></div>" 

	    $("#" + playerId).html( endHTML );
	}

	var displayNextEvent = function(){
		
		removeReplayEvents(); 

		replayDataIndex++;

		var player1Event =  $scope.player1Events[ replayDataIndex ];
		var player2Event =  $scope.player2Events[ replayDataIndex ];

		if ( undefined !== player1Event ) displayReplayEvent("player1", player1Event);
		else displayEndEvent("player1");

	    if ( undefined !== player2Event ) displayReplayEvent("player2", player2Event);
	    else displayEndEvent("player2");

		if (bLog) console.log("ReplayViewController - displayNextEvent");

	}

	$scope.getReplay = function() {
	    
	    ReplayHuntApiFactory.getReplay().then(function(response) {

			if (bLog) console.log("==========================================");
	    	if (bLog) console.log(response,"ReplayViewController - getReplay - response");
	    	if (bLog) console.log("==========================================");

	      	$scope.replayReady = true;
	      
	      	var replayDataObj = response.data;

	      	var unsortedReplayData = [];

	        for ( var replayIndex in replayDataObj ) {
	          
	          var properties = replayDataObj[replayIndex].split(', ');
	          var gameObj = {};
	          
	          properties.forEach(function(property) {
	              var tup = property.split(':');
	              gameObj[tup[0]] = tup[1];
	          });

	          //if (bLog) console.log(gameObj, "ReplayViewController - getReplay - gameObj");

	          var proNameDisplayCase = gameObj.proName.split(" ")[4];
	          var proNameStr = proNameDisplayCase.toLowerCase(); 
	          
	          if ( gameObj.hasOwnProperty("player1") ) gameObj.player1 = proNameStr;
	          else gameObj.player2 = proNameStr;
	         
	          gameObj.proName = proNameStr;
	          gameObj.proNameDisplayCase = proNameDisplayCase;

	          unsortedReplayData.push(gameObj);
	      	
	      	}

	      	// create a match array which has 2 players in each object
	      	// 

	      	if (bLog) console.log(unsortedReplayData, "\n\n *****************************************************");
	      	if (bLog) console.log(unsortedReplayData, "ReplayViewController - getReplay - unsortedReplayData");
	    
	      	

	      	/*
	      	if ( $scope.playerSelectedId === "player1" && ( $scope.playerSelectedName === $scope.selectedMatch.proName ) ) {
	      		player1Events = $filter('filter')(unsortedReplayData, {proName: $scope.selectedMatch.player1.toLowerCase() });
	      		player2Events = $filter('filter')(unsortedReplayData, {proName: $scope.selectedMatch.player2.toLowerCase() });
	      	} else {
	      		player1Events = $filter('filter')(unsortedReplayData, {proName: '!' + $scope.playerSelectedName.toLowerCase() });
	      		player2Events = $filter('filter')(unsortedReplayData, {proName: $scope.playerSelectedName.toLowerCase() });
	      	}
	      	*/

	      	if (bLog) console.log($scope.selectedMatch, "ReplayViewController - onMatchSelectedHandler - $scope.selectedMatch");

	      	$scope.player1Events = $filter('filter')(unsortedReplayData, {proName: $scope.selectedMatch.player1.proName.toLowerCase() });
	      	$scope.player2Events = $filter('filter')(unsortedReplayData, {proName: '!' + $scope.selectedMatch.player1.proName.toLowerCase() });

	      	if (bLog) console.log($scope.player1Events, "ReplayViewController - getReplay - player1Events");
	      	if (bLog) console.log($scope.player2Events, "ReplayViewController - getReplay - player2Events");
	      	if (bLog) console.log($scope.selectedMatch, "ReplayViewController - getReplay - selectedMatch");

	      	// replayDataIndex 

	      	displayReplayEvent("player1", $scope.player1Events[ replayDataIndex ]);
	      	displayReplayEvent("player2", $scope.player2Events[ replayDataIndex ])

	      	$scope.bPreloaderMessage = false;

	    });
	}
   
}]);

// $scope.$apply();
	      //$timeout(timeoutHandler, 0);

/*

	          if (playerName === player1Name) {

	          	// name is the name of the event while player is the name of the player

	          	console.log( gameObj.name.trim() )

	          	if ( gameEventStr === "BasicCommandEvent" && undefined !== gameObj.ability_name) {

	          		//var player1li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
	          		
	          		

	          			var player1li = "<li>" + $scope.getGraphicByAbility( gameObj.ability_name ) + "</li>";

	          			console.log( $scope.getGraphicByAbility( gameObj.ability_name ) )
	          			player1ResultHtml += player1li;
	          		
	          	}



	          } else {

	          	if ( gameEventStr === "BasicCommandEvent" && undefined !== gameObj.ability_name) {

	          		//var player1li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
	          		var player2li = "<li>" + $scope.getGraphicByAbility( gameObj.ability_name ) + "</li>";

	          		console.log( $scope.getGraphicByAbility( gameObj.ability_name ) )
	          		player2ResultHtml += player2li;
	          	}

	          }

*/