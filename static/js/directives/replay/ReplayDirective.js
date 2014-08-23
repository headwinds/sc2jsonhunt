'use strict';

angular.module('metamatch.directives')
    .directive('replay', ['ConfigureFactory', 'ReplayHuntApiFactory', function(ConfigureFactory, ReplayHuntApiFactory) {
      
      var bLog = false;

      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/replay.html'
      }
}]);