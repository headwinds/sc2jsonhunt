angular.module('photohunt.controllers').controller('ReplayViewController', 
	['$scope', '$location', 'Conf', 'ReplayHuntApi', '$timeout', '$window', function ($scope, $location, Conf, ReplayHuntApi, $timeout, $window) {

	$scope.init = function(){
		console.log("ReplayViewController - init" );

		$scope.getReplay();
	}

	$scope.getReplay = function() {
	    
	    ReplayHuntApi.getReplay().then(function(response) {
	    
	      $scope.replayReady = true;
	      
	      //
	      var timeoutHandler = function(){
	        
	        console.log("controllers - getReplay - response - timeout finished" );
	        
	        $scope.replayData = response;
	        console.log($scope.replayData, "controllers - getReplay - response ");

	        var replayDataObj = $scope.replayData.data;

	        var resultHtml = "<ul>";
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

	          var playerName; 
	          switch(gameObj.player){
	            case "Player 1 - Fenner (Zerg)" :
	              playerName = "Fenner";
	              break;
	            default :
	              playerName = "Fenner";
	              break;   

	          }  

	          var li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
	          //console.log(li)
	          resultHtml += li;

	        }

	        resultHtml += "</ul>";

	        $("#preloader").hide();
	        $("#replayDump").html( resultHtml );

	        $scope.$apply();
	      }

	      $timeout(timeoutHandler, 500);
	    })
	}
   
}]);