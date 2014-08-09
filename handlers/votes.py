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

"""VotesHandler"""

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

class VotesHandler(JsonRestHandler, SessionEnabledHandler):
  """Provides an API for working with Votes.  This servlet provides the
     /api/votes end-point, and exposes the following operations:

       PUT /api/votes
  """

  def put(self):
    """Exposed as `PUT /api/votes`.

       Takes a request payload that is a JSON object containing the Photo ID
       for which the currently logged in user is voting.

       {
         'photoId':0
       }

       Returns the following JSON response representing the Photo for which the
       User voted.

       {
         'id':0,
         'ownerUserId':0,
         'ownerDisplayName':'',
         'ownerProfileUrl':'',
         'ownerProfilePhoto':'',
         'themeId':0,
         'themeDisplayName':'',
         'numVotes':1,
         'voted':true,
         'created':0,
         'fullsizeUrl':'',
         'thumbnailUrl':'',
         'voteCtaUrl':'',
         'photoContentUrl':''
       }

       Issues the following errors along with corresponding HTTP response codes:
       401: 'Unauthorized request'.  No user was connected to disconnect.
       401: 'Access token expired'.  Retry with a new access token.
       500: 'Error writing app activity: ' + error from client library
    """
    try:
      user = self.get_user_from_session()
      vote = model.Vote()
      vote.from_json(self.request.body)
      vote.owner_user_id = user.key().id()
      voteExist = model.Vote.all().filter(
          "owner_user_id =", user.key().id()).filter(
          "photo_id =", vote.photo_id).get()
      if voteExist is None:
        photo = model.Photo.get_by_id(vote.photo_id)
        if photo is not None:
          vote.put()
          photo.voted = True
          self.add_photo_to_google_plus_activity(user, photo)
          self.send_success(photo)
          return
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)

  def add_photo_to_google_plus_activity(self, user, photo):
    """Add to the user's Google+ app activity that they voted on photo.

    Args:
      user: User voting.
      photo: Photo being voted on.
    """
    activity = {"type":"http://schemas.google.com/ReviewActivity",
              "target": {
                "url": photo.photo_content_url
              },
              "result": {
                "type": "http://schema.org/Review",
                "name": "A vote for a photohunt photo",
                "url": photo.photo_content_url,
                "text": "Voted!"
              }}
    http = httplib2.Http()
    plus = build('plus', 'v1', http=http)
    if user.google_credentials:
      http = user.google_credentials.authorize(http)
    return plus.moments().insert(userId='me', collection='vault',
                                    body=activity).execute()

