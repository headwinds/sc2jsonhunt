'use strict';

angular.module('photohunt',
    ['photohunt.services', 'photohunt.directives', 'photohunt.filters', 'photohunt.controllers'],
    function($locationProvider) {
      
      $locationProvider.html5Mode(true);

      console.log("app.js - photohunt - init");


    }
);


angular.module('metamatch.directives', []);
angular.module('metamatch.controllers', []);
angular.module('metamatch.filters', []);
angular.module('metamatch.factories', []);
angular.module('metamatch.services', []);
angular.module('metamatch.utils', []);

angular.module('metamatch.fightcard', []);
angular.module('metamatch.versus', []);
angular.module('metamatch.results', []);

angular.module('metamatch', [ 'metamatch.fightcard', 
                              'metamatch.versus', 
                              'metamatch.results', 
                              'metamatch.directives', 
                              'metamatch.controllers', 
                              'metamatch.factories',
                              'metamatch.utils'],

	function($locationProvider) {
      
      $locationProvider.html5Mode(true);
      console.log("app.js - METAMATCH - init");

    }
);

var sayHi = function(){
	console.log("app.js - hi");
}

sayHi();

// hey there