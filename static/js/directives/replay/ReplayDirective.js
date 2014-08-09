'use strict';

angular.module('photohunt.directives', ['photohunt.services'])
    .directive('replay', function(Conf, ReplayHuntApi) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          replayReady: '&replayReady',
          replayFileName: '&replayFileName',
          replayData: '&replayData'
        },
        templateUrl: 'partials/replay.html',
        link: function (scope, element, attrs) {

          console.log("directives - replay - init")

          element.find('.nextButton')
              .click(function(evt) {
                // console.log("directives - replay nextbutton - click")
              });
        }
      }
    })
;