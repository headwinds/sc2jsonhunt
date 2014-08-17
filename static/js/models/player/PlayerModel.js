angular.module('cabinquest.bellwoods').factory("PlayerModel", function() {
    return function( proNameStr, portraitPathStr ) {
			this.proname = proNameStr;
			this.portraitPath = portraitPathStr;
		} 
    }
);
