'use strict';

angular.module('metamatch.directives')
    .directive("player", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/player.html',
            replace: true,
            scope: {
          		playermodel: '='
        	}
        };
    })
;