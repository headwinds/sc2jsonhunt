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

'use strict';

angular.module('metamatch.factories')
    .factory('ReplayHuntApiFactory', ['$http', 'ConfigureFactory', function($http, ConfigureFactory) {
      return {
        signIn: function(authResult) {
          return $http.post(ConfigureFactory.apiBase + 'connect', authResult);
        },
        votePhoto: function(photoId) {
          return $http.put(ConfigureFactory.apiBase + 'votes',
              {'photoId': photoId});
        },
        getThemes: function() {
          return $http.get(ConfigureFactory.apiBase + 'themes');
        },
        getUploadUrl: function() {
          return $http.post(ConfigureFactory.apiBase + 'images');
        },
        getAllPhotosByTheme: function(themeId) {
          return $http.get(ConfigureFactory.apiBase + 'photos',
              {params: {'themeId': themeId}});
        },
        getPhoto: function(photoId) {
          return $http.get(ConfigureFactory.apiBase + 'photos', {params:
              {'photoId': photoId}});
        },
        getUserPhotosByTheme: function(themeId) {
          return $http.get(ConfigureFactory.apiBase + 'photos', {params: 
              {'themeId': themeId, 'userId': 'me'}});
        },
        getFriends: function () {
          return $http.get(ConfigureFactory.apiBase + 'friends');
        },
        getFriendsPhotosByTheme: function(themeId) {
          return $http.get(ConfigureFactory.apiBase + 'photos', {params:
              {'themeId': themeId, 'userId': 'me', 'friends': 'true'}});
        },
        deletePhoto: function(photoId) {
          return $http.delete(ConfigureFactory.apiBase + 'photos', {params:
              {'photoId': photoId}});
        },
        disconnect: function() {
          return $http.post(ConfigureFactory.apiBase + 'disconnect');
        },
        getReplay: function(replayId) {
          return $http.get(ConfigureFactory.apiBase + 'replay', {params:
              {'replayId': replayId}});
        }
      };
    }])
;
