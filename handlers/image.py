#!/usr/bin/python
# Copyright 2013 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

"""ImageHandler"""

import httplib2
import model
import logging
import json
import os
import random
import string
import apiclient
import webapp2
import datetime
import jinja2
import re
from apiclient.discovery import build
from google.appengine.ext import db
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from google.appengine.api import urlfetch
from google.appengine.api.app_identity import get_default_version_hostname
import oauth2client
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from webapp2_extras import sessions

from handlers.session import SessionEnabledHandler
from handlers.session import UserNotAuthorizedException
from handlers.session import NotFoundException
from handlers.session import RevokeException
from handlers.session import JsonRestHandler

class ImageHandler(JsonRestHandler, SessionEnabledHandler):
  """Provides an API for creating and retrieving URLs to which photo images can
  be uploaded.

  This handler provides the /api/images end-point, and exposes the following
  operations:
    POST /api/images
  """

  def post(self):
    """Exposed as `POST /api/images`.

    Creates and returns a URL that can be used to upload an image for a
    photo. Returned URL, after receiving an upload, will fire a callback
    (resend the entire HTTP request) to /api/photos.

    Takes no request payload.

    Returns the following JSON response representing an upload URL:

    {
      "url": "http://appid.appspot.com/_ah/upload/upload-key"
    }

    Issues the following errors along with corresponding HTTP response codes:
    401: 'Unauthorized request'
    """
    user = self.get_user_from_session()
    upload_url_string = blobstore.create_upload_url('/api/photos')
    self.send_success(model.UploadUrl(url = upload_url_string))

  def get(self):
    """Serve an image."""
    photo_id = self.request.get('id')
    photo = model.Photo.all().filter('id=', photo_id).get()
    self.response.headers['Content-Type'] = 'image/png'
    self.response.out.write(photo.image_blob)


class PhotosHandler(JsonRestHandler, SessionEnabledHandler,
    blobstore_handlers.BlobstoreUploadHandler):
  """Provides an API for working with Photos.

  This handler provides the /api/photos endpoint, and exposes the following
  operations:
    GET /api/photos
    GET /api/photos?photoId=1234
    GET /api/photos?themeId=1234
    GET /api/photos?userId=me
    GET /api/photos?themeId=1234&userId=me
    GET /api/photos?themeId=1234&userId=me&friends=true
    POST /api/photos
    DELETE /api/photos?photoId=1234
  """

  def get(self):
    """Exposed as `GET /api/photos`.

    Accepts the following request parameters.

    'photoId': id of the requested photo. Will return a single Photo.
    'themeId': id of a theme. Will return the collection of photos for the
               specified theme.
     'userId': id of the owner of the photo. Will return the collection of
               photos for that user. The keyword 'me' can be used and will be
               converted to the logged in user. Requires auth.
    'friends': value evaluated to boolean, if true will filter only photos
               from friends of the logged in user. Requires auth.

    Returns the following JSON response representing a list of Photos.

    [
      {
        'id':0,
        'ownerUserId':0,
        'ownerDisplayName':'',
        'ownerProfileUrl':'',
        'ownerProfilePhoto':'',
        'themeId':0,
        'themeDisplayName':'',
        'numVotes':0,
        'voted':false, // Whether or not the current user has voted on this.
        'created':0,
        'fullsizeUrl':'',
        'thumbnailUrl':'',
        'voteCtaUrl':'', // URL for Vote interactive post button.
        'photoContentUrl':'' // URL for Google crawler to hit to get info.
      },
      ...
    ]

    Issues the following errors along with corresponding HTTP response codes:
    401: 'Unauthorized request' (if certain parameters are present in the
    request)
    """
    try:
      photo_id = self.request.get('photoId')
      theme_id = self.request.get('themeId')
      user_id = self.request.get('userId')
      show_friends = bool(self.request.get('friends'))
      query = model.Photo.all()
      if photo_id:
        photo = model.Photo.get_by_id(long(photo_id))
        self.send_success(photo)
        return
      else:
        if user_id:
          if user_id == 'me':
            user = self.get_user_from_session()
          else:
            user = model.User.get_by_id(long(user_id))
          if show_friends:
            user = self.get_user_from_session()
            friends = user.get_friends()
            if len(friends) > 0:
              query = query.filter('owner_user_id in', friends[0:30])
            else:
              self.send_success([])
              return
          else:
            query = query.filter('owner_user_id =', user.key().id())

      if theme_id:
        query = query.filter('theme_id =', long(theme_id))

      photos = list(query.run())

      if self.session.get(self.CURRENT_USER_SESSION_KEY) is not None:
        if not user_id:
          user = self.get_user_from_session()

        votes = model.Vote.all().filter(
            "owner_user_id =", user.key().id()).run()
        photo_votes = []
        for vote in votes:
          photo_votes.append(vote.photo_id)
        for photo in photos:
          photo.voted = photo.key().id() in photo_votes

      self.send_success(photos, jsonkind='photohunt#photos')
    except TypeError as te:
      self.send_error(404, "Resource not found")
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)

  def post(self):
    """Exposed as `POST /api/photos`.

    Takes the following payload in the request body.  Payload represents a
    Photo that should be created.
    {
      'id':0,
      'ownerUserId':0,
      'ownerDisplayName':'',
      'ownerProfileUrl':'',
      'ownerProfilePhoto':'',
      'themeId':0,
      'themeDisplayName':'',
      'numVotes':0,
      'voted':false, // Whether or not the current user has voted on this.
      'created':0,
      'fullsizeUrl':'',
      'thumbnailUrl':'',
      'voteCtaUrl':'', // URL for Vote interactive post button.
      'photoContentUrl':'' // URL for Google crawler to hit to get info.
    }

    Returns the following JSON response representing the created Photo.
    {
      'id':0,
      'ownerUserId':0,
      'ownerDisplayName':'',
      'ownerProfileUrl':'',
      'ownerProfilePhoto':'',
      'themeId':0,
      'themeDisplayName':'',
      'numVotes':0,
      'voted':false, // Whether or not the current user has voted on this.
      'created':0,
      'fullsizeUrl':'',
      'thumbnailUrl':'',
      'voteCtaUrl':'', // URL for Vote interactive post button.
      'photoContentUrl':'' // URL for Google crawler to hit to get info.
    }

    Issues the following errors along with corresponding HTTP response codes:
    400: 'Bad Request' if the request is missing image data.
    401: 'Unauthorized request' (if certain parameters are present in the
         request)
    401: 'Access token expired' (there is a logged in user, but he doesn't
         have a refresh token and his access token is expiring in less than
         100 seconds, get a new token and retry)
    500: 'Error while writing app activity: ' + error from client library.
    """
    try:
      user = self.get_user_from_session()
      current_theme = model.Theme.get_current_theme()
      if current_theme:
        uploads = self.get_uploads('image')
        blob_info = uploads[0]
        photo = model.Photo(owner_user_id=user.key().id(),
            owner_display_name=user.google_display_name,
            owner_profile_photo=user.google_public_profile_photo_url,
            owner_profile_url=user.google_public_profile_url,
            theme_id=current_theme.key().id(),
            theme_display_name=current_theme.display_name,
            created=datetime.datetime.now(),
            num_votes=0,
            image_blob_key=blob_info.key())
        photo.put()
        try:
          result = self.add_photo_to_google_plus_activity(user, photo)
        except apiclient.errors.HttpError as e:
          logging.error("Error while writing app activity: %s", str(e))
        self.send_success(photo)
      else:
        self.send_error(404, 'No current theme.')
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)

  def delete(self):
    """Exposed as `DELETE /api/photos`.

    Accepts the following request parameters.

    'photoId': id of the photo to delete.

    Returns the following JSON response representing success.
    'Photo successfully deleted.'

    Issues the following errors along with corresponding HTTP response codes:
    401: 'Unauthorized request' (if certain parameters are present in the
         request)
    404: 'Photo with given ID does not exist.'
    """
    try:
      user = self.get_user_from_session()
      photo_id = self.request.get('photoId')
      if photo_id:
        photo = model.Photo.get_by_id(long(photo_id))
        if photo.owner_user_id != user.key().id():
          raise UserNotAuthorizedException
        photoVotes = model.Vote.all().filter(
          "photo_id =", photo.key().id()).run()
        db.delete(photo)
        db.delete(photoVotes)
        self.send_success(model.Message(message = "Photo successfully deleted"))
      else:
        raise NotFoundException
    except NotFoundException as nfe:
      self.send_error(404, nfe.msg)
    except TypeError as te:
      self.send_error(404, "Resource not found")
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)

  def add_photo_to_google_plus_activity(self, user, photo):
    """Creates an app activity in Google indicating that the given User has
    uploaded the given Photo.

    Args:
      user: Creator of Photo.
      photo: Photo itself.
    """
    activity = {"type":"http://schemas.google.com/AddActivity",
              "target": {
                "url": photo.photo_content_url
              }}
    logging.debug("activity: " + str(activity))
    http = httplib2.Http()
    plus = build('plus', 'v1', http=http)
    if user.google_credentials:
      http = user.google_credentials.authorize(http)
    return plus.moments().insert(userId='me', collection='vault',
                                    body=activity).execute()

