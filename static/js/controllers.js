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

angular.module('metamatch.controllers').controller('PhotoHuntCtrl', 
  ['$scope', '$location', 'Conf', 'ReplayHuntApi', '$timeout', function ($scope, $location, Conf, ReplayHuntApi, $timeout) {

//function PhotoHuntCtrl($scope, $location, Conf, ReplayHuntApi, $timeout) {
  // signIn
  $scope.userProfile = undefined;
  $scope.hasUserProfile = false;
  $scope.isSignedIn = false;
  $scope.immediateFailed = false;
  // themes
  $scope.selectedTheme;
  $scope.themes = [];
  // photos
  $scope.ordering;
  $scope.recentButtonClasses;
  $scope.popularButtonClasses;
  $scope.highlightedPhoto;
  $scope.userPhotos = [];
  $scope.friendsPhotos = [];
  $scope.allPhotos = [];
  // friends
  $scope.friends = [];
  // uploads
  $scope.uploadUrl;

  // replay
  $scope.replayReady = false;
  $scope.replayData = {};

  $scope.disconnect = function() {
    ReplayHuntApi.disconnect().then(function() {
      $scope.userProfile = undefined;
      $scope.hasUserProfile = false;
      $scope.isSignedIn = false;
      $scope.immediateFailed = true;
      $scope.userPhotos = [];
      $scope.friendsPhotos = [];
      //$scope.renderSignIn();
    });
  }
  
  // methods
  $scope.orderBy = function (criteria) {
    var activeItemClasses = ['active','primary'];
    if (criteria == 'recent') {
      $scope.ordering = '-dateCreated';
      $scope.recentButtonClasses = activeItemClasses;
      $scope.popularButtonClasses = [];
    } else if (criteria == 'popular') {
      $scope.ordering = '-votes';
      $scope.popularButtonClasses = activeItemClasses;
      $scope.recentButtonClasses = [];
    } else {
      return 0;
    }
  };
  
  $scope.adaptPhotos = function(photos) {
    angular.forEach(photos, function(value, key) {
      value['canDelete'] = false;
      value['canVote'] = false;
      value['voteClass'] = [];
      if ($scope.hasUserProfile) {
        if (value.ownerUserId == $scope.userProfile.id) {
          value['canDelete'] = true;
        } else {
          if ($scope.userProfile.role == 'admin') {
            value['canDelete'] = true;
          }
          value['canVote'] = true;
          value['voteClass'] = ['button', 'icon', 'arrowup'];
          if (value.voted) {
            value['voteClass'].push('disable');
          } else {
            value.voted = false;
          }
        }
      }
    });
    return photos;
  }
  
  $scope.deletePhoto = function(photoId) {
    ReplayHuntApi.deletePhoto(photoId);
    $scope.userPhotos = $scope.removePhotoFromArray($scope.userPhotos, photoId);
    $scope.friendsPhotos = $scope.removePhotoFromArray($scope.friendsPhotos, photoId);
    $scope.allPhotos = $scope.removePhotoFromArray($scope.allPhotos, photoId);
  }
  
  $scope.removePhotoFromArray = function (array, photoId) {
    var newArray = [];
    angular.forEach(array, function(value, key) {
      if (value.id != photoId) {
        newArray.push(value);
      }
    });
    return newArray;
  }
  
  $scope.getUserPhotos = function() {
    if ($scope.hasUserProfile && ($scope.themes.length > 0)) {
      ReplayHuntApi.getUserPhotosByTheme($scope.selectedTheme.id)
      	  .then(function(response) {
        $scope.userPhotos = $scope.adaptPhotos(response.data);
      });
    }
  }
  
  $scope.getAllPhotos = function() {
    ReplayHuntApi.getAllPhotosByTheme($scope.selectedTheme.id)
    	.then(function(response) {
      $scope.allPhotos = $scope.adaptPhotos(response.data);
    });
  }
  
  $scope.getFriendsPhotos = function() {
    ReplayHuntApi.getFriendsPhotosByTheme($scope.selectedTheme.id)
        .then(function(response) {
      $scope.friendsPhotos = $scope.adaptPhotos(response.data);
    });
  }
  
  $scope.getUploadUrl = function(params) {
    ReplayHuntApi.getUploadUrl().then(function(response) {
      $scope.uploadUrl = response.data.url;
    });
  }
  
  $scope.checkIfVoteActionRequested = function() {
    if($location.search()['action'] == 'VOTE') {
      ReplayHuntApi.votePhoto($location.search()['photoId'])
          .then(function(response) {
        var photo = response.data;
        $scope.highlightedPhoto = photo;
        $scope.notification = 'Thanks for voting!';
      });
    }
  }
  
  $scope.getFriends = function() {
    ReplayHuntApi.getFriends().then(function(response) {
      $scope.friends = response.data;
      $scope.getFriendsPhotos();
    })
  }

  /*
  $scope.getReplay = function() {
    ReplayHuntApi.getReplay().then(function(response) {
    
      $scope.replayReady = true;
      
      //
      var timeoutHandler = function(){
        console.log("controllers - getReplay - response - timeout finished" );
        $scope.replayData = response;
        console.log($scope.replayData, "controllers - getReplay - response ");

        var replayDataObj = $scope.replayData.data;

        var resultHtml = "<ul>";
        for ( var replayIndex in replayDataObj ) {
          
          var properties = replayDataObj[replayIndex].split(', ');
          var gameObj = {};
          properties.forEach(function(property) {
              var tup = property.split(':');
              gameObj[tup[0]] = tup[1];
          });

          //var moment = moment().seconds( Number(gameObj.seconds) );
          var gameSecondsNum = Number(gameObj.second);
          //console.log(gameSecondsNum);

          var gameTimeObj = moment({s: gameSecondsNum});

          var minsStr = String( gameTimeObj.minutes() ); //moment.minutes;
          var secondsStr = String( gameTimeObj.seconds() ); //moment.seconds; 

          if ( Number(secondsStr) < 10 ) secondsStr = "0" + secondsStr; 

          var playerName; 
          switch(gameObj.player){
            case "Player 1 - Fenner (Zerg)" :
              playerName = "Fenner";
              break;
            default :
              playerName = "Fenner";
              break;   

          }  

          var li = "<li>" + playerName + " performed: " + gameObj.name + " @ time: " + minsStr + ":" + secondsStr + "</li>";
          //console.log(li)
          resultHtml += li;

        }

        resultHtml += "</ul>";

        $("#preloader").hide();
        $("#replayDump").html( resultHtml );

        $scope.$apply();
      }

      $timeout(timeoutHandler, 500);
    })
  }
  */
  
  $scope.selectTheme = function(themeIndex) {
    $scope.selectedTheme = $scope.themes[themeIndex];
    if ($scope.selectedTheme.id != $scope.themes[0].id) {
      $scope.orderBy('popular');
    }
    $scope.getAllPhotos();
    if($scope.isSignedIn) {
      $scope.getUserPhotos();
    }
    if ($scope.friends.length) {
      $scope.getFriendsPhotos();
    }
  }
  
  $scope.canUpload = function() {
    if ($scope.uploadUrl)
      return true;
    else
      return false;
  }
  
  $scope.uploadedPhoto = function(uploadedPhoto) {
    uploadedPhoto['canDelete'] = true;
    $scope.userPhotos.unshift(uploadedPhoto);
    $scope.allPhotos.unshift(uploadedPhoto);
    $scope.getUploadUrl();
  }
  
  $scope.signedIn = function(profile) {
    $scope.isSignedIn = true;
    $scope.userProfile = profile;
    $scope.hasUserProfile = true;
    $scope.getUserPhotos();
    // refresh the state of operations that depend on the local user
    $scope.allPhotos = $scope.adaptPhotos($scope.allPhotos);
    // now we can perform other actions that need the user to be signed in
    $scope.getUploadUrl();
    $scope.checkIfVoteActionRequested();
    $scope.getFriends();
  };
  
  $scope.checkForHighlightedPhoto = function() {
    if($location.search()['photoId']) {
      ReplayHuntApi.getPhoto($location.search()['photoId'])
          .then(function(response) {
        $scope.highlightedPhoto = response.data;
      })
    }
  }
  
  $scope.signIn = function(authResult) {
    $scope.$apply(function() {
      $scope.processAuth(authResult);
    });
  }
  
  $scope.processAuth = function(authResult) {
    $scope.immediateFailed = true;
    if ($scope.isSignedIn) {
      return 0;
    }
    if (authResult['access_token']) {
      $scope.immediateFailed = false;
      // Successfully authorized, create session
      ReplayHuntApi.signIn(authResult).then(function(response) {
        $scope.signedIn(response.data);
      });
    } else if (authResult['error']) {
      if (authResult['error'] == 'immediate_failed') {
        $scope.immediateFailed = true;
      } else {
        console.log('Error:' + authResult['error']);
      }
    }
  }
  
  $scope.renderSignIn = function() {
    gapi.signin.render('myGsignin', {
      'callback': $scope.signIn,
      'clientid': Conf.clientId,
      'requestvisibleactions': Conf.requestvisibleactions,
      'scope': Conf.scopes,
      'apppackagename': Conf.apppackagename,
      'theme': 'dark',
      'cookiepolicy': Conf.cookiepolicy,
      'accesstype': 'offline'
    });
  }

  $scope.renderReplay = function() {
     //$scope.getReplay();
     //ReplayViewController.getReplay();
  }
  
  $scope.start = function() {

    console.log("controllers - start");
    
    //$scope.renderSignIn();
    //$scope.renderReplay();
    $scope.checkForHighlightedPhoto();
    
    ReplayHuntApi.getThemes().then(function(response) {
      
      $scope.themes = response.data;
      $scope.selectedTheme = $scope.themes[0];
      $scope.orderBy('recent');
      $scope.getUserPhotos();
      
      var options = {
        'clientid': Conf.clientId,
        'contenturl': Conf.rootUrl + '/invite.html',
        'contentdeeplinkid': '/',
        'prefilltext': 'Join the hunt, upload and vote for photos of ' +
            $scope.selectedTheme.displayName + '. #photohunt',
        'calltoactionlabel': 'Join',
        'calltoactionurl': Conf.rootUrl,
        'calltoactiondeeplinkid': '/',
        'callback': $scope.signIn,
        'requestvisibleactions': Conf.requestvisibleactions,
        'scope': Conf.scopes,
        'cookiepolicy': Conf.cookiepolicy
      };

      gapi.interactivepost.render('invite', options);
      //$scope.getAllPhotos();

      console.log("controllers - start - getThemes response - now get replays");

     

    });


  }
  
  $scope.start();
  
}]);
