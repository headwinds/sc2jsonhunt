angular.module('metamatch.factories').factory("PlayerModel", function() {
    return function( proNameStr, portraitPathStr ) {
			this.proName = proNameStr;
			this.portraitPath = portraitPathStr;
		} 
    }
);
