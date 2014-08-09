
'use strict';

angular.module('photohunt.events', [])
  .factory('EventBus', function () {
    return {message: "I'm data from EventBus service"}
  });
;