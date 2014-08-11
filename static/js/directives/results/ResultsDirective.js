'use strict';

angular.module('photohunt.directives')
     .directive("results", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/results.html',
            replace: true
        };

    })
;