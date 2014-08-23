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

	          if (playerName === "Fenner") {

	          	var player1li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
	          	//console.log(li)
	          	player1ResultHtml += player1li;

	          } else {

	          	var player2li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
	          	//console.log(li)
	          	player2ResultHtml += player2li;

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