angular.module('metamatch.factories').factory("PlayerModel", function() {
    return function( proNameStr, portraitPathStr, playerNum ) {
			this.proName = proNameStr.toLowerCase();
			this.proNameCase = proNameStr;
			this.portraitPath = portraitPathStr;
			this.playerNum = playerNum;
		} 
    }
);
