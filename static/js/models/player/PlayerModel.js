angular.module('photohunt').factory("PlayerModel", function() {
    return function( proNameStr, portraitPathStr ) {
			this.proName = proNameStr;
			this.portraitPath = portraitPathStr;
		} 
    }
);
