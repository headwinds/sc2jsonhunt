'use strict';

angular.module('metamatch.directives')
    .directive("versus", function () {
        return {
            restrict: 'E',
           	templateUrl: 'partials/versus.html',
            replace: true
        };

    })
;