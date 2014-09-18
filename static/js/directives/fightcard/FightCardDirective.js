'use strict';

// http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-3-isolate-scope-and-function-parameters

angular.module('metamatch.directives')
    .directive("fightcard", function () {
        return {
            restrict: 'E',
            templateUrl: 'partials/fightcard.html',
            //template: '<p>Fightcard</p>',
            replace: true,
            datasource: "="
        };
    })
;