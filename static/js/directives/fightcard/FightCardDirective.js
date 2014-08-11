'use strict';

angular.module('photohunt.directives')
    .directive("fightcard", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/fightcard.html',
            //template: '<p>Fightcard</p>',
            replace: true
        };
    })
;