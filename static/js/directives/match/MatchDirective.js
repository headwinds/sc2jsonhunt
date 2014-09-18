'use strict';

angular.module('metamatch.directives')
    .directive("match", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/match.html',
            replace: true,
            scope: {
          		matchmodel: '='
        	}
        };
    })
;