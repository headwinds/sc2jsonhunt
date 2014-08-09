'use strict';

angular.module('photohunt.directives', ['photohunt.services'])
    .directive('fightcard', function(Conf, ReplayHuntApi) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          
        },
        templateUrl: 'partials/fightcard.html',
        link: function (scope, element, attrs) {

          console.log("directives - fightcard - init")

          element.find('.nextButton')
              .click(function(evt) {
                // console.log("directives - fightcard nextbutton - click")
              });
        }
      }
    })
;