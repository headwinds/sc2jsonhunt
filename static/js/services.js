/*
 * Copyright (c) 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

/*
'use strict';

angular.module('photohunt.factories')
    .factory('Conf', function($location) {
      function getRootUrl() {
        var rootUrl = $location.protocol() + '://' + $location.host();
        if ($location.port())
          rootUrl += ':' + $location.port();
        return rootUrl;
      };
      return {
        'clientId': '317913143898-ihmdutte2jeinefnuot4cdrjm7i22r1c.apps.googleusercontent.com',
        'apiBase': '/api/',
        'rootUrl': getRootUrl(),
        'scopes': 'https://www.googleapis.com/auth/plus.login ',
        'requestvisibleactions': 'http://schemas.google.com/AddActivity ' +
                'http://schemas.google.com/ReviewActivity',
         'cookiepolicy': 'single_host_origin'
      };
    })
    .factory('ReplayHuntApi', function($http, Conf) {
      return {
        signIn: function(authResult) {
          return $http.post(Conf.apiBase + 'connect', authResult);
        },
        votePhoto: function(photoId) {
          return $http.put(Conf.apiBase + 'votes',
              {'photoId': photoId});
        },
        getThemes: function() {
          return $http.get(Conf.apiBase + 'themes');
        },
        getUploadUrl: function() {
          return $http.post(Conf.apiBase + 'images');
        },
        getAllPhotosByTheme: function(themeId) {
          return $http.get(Conf.apiBase + 'photos',
              {params: {'themeId': themeId}});
        },
        getPhoto: function(photoId) {
          return $http.get(Conf.apiBase + 'photos', {params:
              {'photoId': photoId}});
        },
        getUserPhotosByTheme: function(themeId) {
          return $http.get(Conf.apiBase + 'photos', {params: 
              {'themeId': themeId, 'userId': 'me'}});
        },
        getFriends: function () {
          return $http.get(Conf.apiBase + 'friends');
        },
        getFriendsPhotosByTheme: function(themeId) {
          return $http.get(Conf.apiBase + 'photos', {params:
              {'themeId': themeId, 'userId': 'me', 'friends': 'true'}});
        },
        deletePhoto: function(photoId) {
          return $http.delete(Conf.apiBase + 'photos', {params:
              {'photoId': photoId}});
        },
        disconnect: function() {
          return $http.post(Conf.apiBase + 'disconnect');
        },
        getReplay: function(replayId) {
          return $http.get(Conf.apiBase + 'replay', {params:
              {'replayId': replayId}});
        }
      };
    })
;
*/