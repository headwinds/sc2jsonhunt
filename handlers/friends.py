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

"""FriendsHandler"""

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

class FriendsHandler(JsonRestHandler, SessionEnabledHandler):
  """Provides an API for working with Users.

  This handler provides the /api/friends end-point, and exposes the following
  operations:
    GET /api/friends
  """

  def get(self):
    """Exposed as `GET /api/friends`.

    Takes no request payload, and identifies the incoming user by the user
    data stored in their session.

    Returns the following JSON response representing the people that are
    connected to the currently signed in user:
    [
      {
        'id':0,
        'googleUserId':'',
        'googleDisplayName':'',
        'googlePublicProfileUrl':'',
        'googlePublicProfilePhotoUrl':'',
        'googleExpiresAt':0
      },
         ...
    ]

    Issues the following errors along with corresponding HTTP response codes:
    401: 'Unauthorized request'
    """
    try:
      user = self.get_user_from_session()
      friends = user.get_friends()
      self.send_success(friends, jsonkind="photohunt#friends")
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)
