'use strict';

angular.module('metamatch.directives')
    .directive("player", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/player.html',
            //template: '<p>Fightcard</p>',
            replace: true
        };
    })
;