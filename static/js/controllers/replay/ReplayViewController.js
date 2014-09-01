/*

	see arcade - "Unit_Test_Map"

*/

angular.module('metamatch.controllers').controller('ReplayViewController', 
	['$rootScope', '$scope', '$location', 'ConfigureFactory', 'ReplayHuntApiFactory', '$timeout', '$window', 
	function ($rootScope, $scope, $location, ConfigureFactory, ReplayHuntApiFactory, $timeout, $window) {

	////////////////////////////////////////////// VARIABLES	

	$scope.bShowApp = false; 
	var bLog = true;

	////////////////////////////////////////////// INIT
	
	$scope.init = function(){
		if (bLog) console.log("ReplayViewController - init" );

		setupEvents();

	
	}

	////////////////////////////////////////////// EVENTS

	var setupEvents = function(){
		$rootScope.$on("fightcard:go", onFightCardGoHandler)
	}

	////////////////////////////////////////////// HANDLERS

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

		var unitName = abilityStr.toLowerCase().split("morph")[1] + ".png";
		
		switch( abilityStr ) {
			case "MorphDrone" :
				unitName = "drone.png";
				break;
			default :
				unitName = "drone.png";
				break;

		}

		var unitPath = imgPath + unitName;
		var graphicHtml = "<img src=" + unitPath + " />"

		return graphicHtml;
	}

	$scope.getReplay = function() {
	    
	    ReplayHuntApiFactory.getReplay().then(function(response) {
	    
	      $scope.replayReady = true;
	      
	      //
	      var timeoutHandler = function(){
	        
	        if (bLog) console.log("ReplayViewController - getReplay - response - timeout finished" );
	        
	        $scope.replayData = response;
	        console.log($scope.replayData, "ReplayViewController - getReplay - response ");

	        var replayDataObj = $scope.replayData.data;

	        var player1ResultHtml = "<ul>";
	        var player2ResultHtml = "<ul>";

	        for ( var replayIndex in replayDataObj ) {
	          
	          var properties = replayDataObj[replayIndex].split(', ');
	          var gameObj = {};
	          properties.forEach(function(property) {
	              var tup = property.split(':');
	              gameObj[tup[0]] = tup[1];
	          });

	          //var moment = moment().seconds( Number(gameObj.seconds) );
	          var gameSecondsNum = Number(gameObj.second);
	          //console.log(gameSecondsNum);

	          var gameTimeObj = moment({s: gameSecondsNum});

	          var minsStr = String( gameTimeObj.minutes() ); //moment.minutes;
	          var secondsStr = String( gameTimeObj.seconds() ); //moment.seconds; 

	          if ( Number(secondsStr) < 10 ) secondsStr = "0" + secondsStr; 

	          var playerName = (gameObj.player1) ? "Fenner" : "Petraeus";

	          /*
				"Player 1 - Fenner (Zerg)"
				"Player 2 - KiseRyota (Zerg)"
	          */  

	          //console.log(gameObj);

	          var gameEventStr = gameObj.name.trim();

	          if (playerName === "Fenner") {

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
 

	          

	        }

	        player1ResultHtml += "</ul>";
	        player2ResultHtml += "</ul>";

	        $("#preloader").hide();
	        $("#player1").html( player1ResultHtml );
	        $("#player2").html( player2ResultHtml );

	        $scope.$apply();
	      }

	      $timeout(timeoutHandler, 500);
	    })
	}
   
}]);