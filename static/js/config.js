'use strict';

var authResolver = {
    resolvedData: ['GlobalService', function(GlobalService) {
        return GlobalService.getAuthUser();
    }]
};

/*
var cabinQuestResolver = {
    resolvedData: ['GlobalService', function(GlobalService) {
        return GlobalService.getCabinQuestUser();
    }]
};
*/

var cabinQuestResolver = {
    resolvedData: ['CabinQuestUserFactoryService', function(CabinQuestUserFactoryService) {
        return CabinQuestUserFactoryService.getCabinQuestUser();
    }]
};

// may eventually need to return several promises and chain them... 
var bellwoodsResolver = {
    resolvedData: ['ForestFactoryService', 'CabinQuestUserFactoryService', '$q', function(
        ForestFactoryService, 
        CabinQuestUserFactoryService,
        $q) {

        var data = { cabinquestUserPromise: null, forestPromise: null }
        // 1. get the user
        var cabinquestUserService = CabinQuestUserFactoryService.getCabinQuestUser()

        console.log(cabinquestUserService, "config - bellwoodsResolver - cabinquestUserService 1.");

        // 2. get the trees 
        /*
       var forestFactoryService = cabinquestUserService.userPromise.then(function(result) {

            console.log(result, "config - bellwoodsResolver - result 2.");

            var cabinquestUserId = result.data.model._id; 

            return ForestFactoryService.getForestByUserId( cabinquestUserId );
        });
       */
       //var forestFactoryService;

       data.cabinquestUserPromise = cabinquestUserService.userPromise;

       cabinquestUserService.userPromise.then(function(result) {

            //console.log(result, "config - bellwoodsResolver - result 2.");

            var cabinquestUserId = result.data.model._id; 

            var forestFactoryService = ForestFactoryService.getForestByUserId( cabinquestUserId );

            data.forestPromise = forestFactoryService.forestPromise;

           // console.log(data, "config - bellwoodsResolver - result 3.");

           

        });

        return data;
       /*

       forestFactoryService.forestPromise.then(function(result) {

            console.log(result, "config - bellwoodsResolver - result 2.");

            var cabinquestUserId = result.data.model._id; 

            return ForestFactoryService.getForestByUserId( cabinquestUserId );
        });
        */

         
       
    }]
};


/*

note: 

If I pass in a controller here, remember not to also add it to the view or may it be called twice

*/

//Setting up route
angular.module('cabinquest').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
         when('/data/dataSnow.json', {
            //templateUrl: 'views/articles/list.html' // hmmmmm
        }).
        when('/articles', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/articles/create', {
            templateUrl: 'views/articles/create.html'
        }).
        when('/articles/:articleId/edit', {
            templateUrl: 'views/articles/edit.html'
        }).
        when('/articles/:articleId', {
            templateUrl: 'views/articles/view.html'
        }).
        when('/request/invite', {
            templateUrl: 'views/request/invite/view.html',
            controller: 'RequestInviteCtrl'
        }).
        when('/profile', {
            templateUrl: 'views/profile/view.html',
            controller: 'ProfileCtrl',
            resolve: cabinQuestResolver
        }).
        when('/map', {
            templateUrl: 'views/map/view.html',
            controller: 'MapCtrl'
        }).
        when('/fileupload', {
            templateUrl: 'views/fileupload/view.html',
            controller: 'FileUploadCtrl',
            resolve: cabinQuestResolver
        }).
        when('/cabin', {
            templateUrl: 'views/cabin/view.html',
            controller: 'CabinCtrl',
            gamedata: 'newGame'
        }).
        when('/cabin/:gameCode', {
            templateUrl: 'views/cabin/view.html',
            controller: 'CabinCtrl',
            gamedata: 'newGame'
        }).
        when('/characters', {
            templateUrl: 'views/characters/view.html',
            controller: 'CharactersCtrl'
        }).
        when('/sample', {
            templateUrl: 'views/sample/view.html',
            controller: 'SampleCtrl'
        }).
        when('/bellwoods', {
            templateUrl: 'views/bellwoods/menu.html',
            controller: 'BellwoodsMenuCtrl'
        }).
        when('/bellwoods/menu', {
            templateUrl: 'views/bellwoods/menu.html',
            controller: 'BellwoodsMenuCtrl'
        }).
        when('/bellwoods/game', {
            templateUrl: 'views/bellwoods/game.html',
            controller: 'BellwoodsGameCtrl',
            resolve: cabinQuestResolver
        }).
        when('/bellwoods/cabin', {
            templateUrl: 'views/cabin/view.html',
            controller: 'CabinCtrl'
        }).
        when('/bellwoods/collection', {
            templateUrl: 'views/bellwoods/collection/view.html',
            controller: 'TreesCtrl'
        }).
        when('/hive', {
            templateUrl: 'views/hive/view.html',
            controller: 'HiveCtrl'
        }).
        when('/', {
            //redirectTo: '/'
            templateUrl: 'views/index.html',
            controller: 'IndexCtrl',
            resolve: authResolver
        }).
        when('/signout', {
            redirectTo: '/'
        }).
        when('/signin', {
            //redirectTo: '/'
            templateUrl: 'views/signin/signin.html',
            controller: 'AuthCtrl'
        }).
        otherwise({
            redirectTo: '/bellwoods'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('cabinquest').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);