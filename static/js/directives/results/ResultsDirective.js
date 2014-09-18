'use strict';

angular.module('metamatch.directives')
     .directive("results", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/results.html',
            replace: true
        };

    })
;