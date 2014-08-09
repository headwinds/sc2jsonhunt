'use strict';

angular.module('photohunt',
    ['photohunt.services', 'photohunt.directives', 'photohunt.filters', 'photohunt.controllers'],
    function($locationProvider) {
      $locationProvider.html5Mode(true);
    }
);

// hey there