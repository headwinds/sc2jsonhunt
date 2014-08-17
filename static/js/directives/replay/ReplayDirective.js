'use strict';

angular.module('photohunt.directives')
    .directive('replay', function(Conf, ReplayHuntApi) {
      
      var bLog = false;

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

          if (bLog) console.log("ReplayDirective - init")

          element.find('.nextButton')
              .click(function(evt) {
                // console.log("ReplayDirective - replay nextbutton - click")
              });
        }
      }
    })
;