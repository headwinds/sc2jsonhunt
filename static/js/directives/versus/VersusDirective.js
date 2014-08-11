'use strict';

angular.module('photohunt.directives')
    .directive("versus", function () {
        return {
            restrict: 'E',
           	templateUrl: 'partials/versus.html',
            replace: true
        };

    })
;