'use strict';

angular.module('photohunt.directives', ['photohunt.services'])
    .directive('versus', function(Conf, ReplayHuntApi) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          replayReady: '&replayReady',
          replayFileName: '&replayFileName',
          replayData: '&replayData'
        },
        templateUrl: 'partials/versus.html',
        link: function (scope, element, attrs) {

          console.log("directives - versus - init")

          element.find('.nextButton')
              .click(function(evt) {
                // console.log("directives - versus nextbutton - click")
              });
        }
      }
    })
;