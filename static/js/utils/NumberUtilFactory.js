angular.module('metamatch.utils').factory("NumberUtilFactory", ['$window', '$rootScope', function($window, $rootScope) {
    
    return function() {
		
		/**
		 * Returns a random number between min (inclusive) and max (exclusive)
		 */
		this.getRandomArbitrary = function(min, max) {
		    return Math.random() * (max - min) + min;
		}

		/**
		 * Returns a random integer between min (inclusive) and max (inclusive)
		 * Using Math.round() will give you a non-uniform distribution!
		 */
		this.getRandomInt = function(min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		this.convertTime = function(gameObj){
		  
		  //var moment = moment().seconds( Number(gameObj.seconds) );
	      var gameSecondsNum = Number(gameObj.second);
	     
	      var gameTimeObj = moment({s: gameSecondsNum});

	      var minsStr = String( gameTimeObj.minutes() ); //moment.minutes;
	      var secondsStr = String( gameTimeObj.seconds() ); //moment.seconds; 

	      if ( Number(secondsStr) < 10 ) secondsStr = "0" + secondsStr; 

	      var gameTimeStr = minsStr + ":" + secondsStr;

	      return gameTimeStr;
		}

	}; 
}]);
