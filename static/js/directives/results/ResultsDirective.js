'use strict';

angular.module('photohunt.directives', ['photohunt.services'])
    .directive('results', function(Conf, ReplayHuntApi) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          replayReady: '&replayReady',
          replayFileName: '&replayFileName',
          replayData: '&replayData'
        },
        templateUrl: 'partials/results.html',
        link: function (scope, element, attrs) {

          console.log("directives - results - init")

          element.find('.nextButton')
              .click(function(evt) {
                // console.log("directives - results nextbutton - click")
              });
        }
      }
    })
;