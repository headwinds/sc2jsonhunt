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

"""SessionEnabledHandler"""

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

class SessionEnabledHandler(webapp2.RequestHandler):
  """Base type which ensures that derived types always have an HTTP session."""
  CURRENT_USER_SESSION_KEY = 'me'

  def dispatch(self):
    """Intercepts default request dispatching to ensure that an HTTP session
    has been created before calling dispatch in the base type.
    """
    # Get a session store for this request.
    self.session_store = sessions.get_store(request=self.request)
    try:
      # Dispatch the request.
      webapp2.RequestHandler.dispatch(self)
    finally:
      # Save all sessions.
      self.session_store.save_sessions(self.response)

  @webapp2.cached_property
  def session(self):
    """Returns a session using the default cookie key."""
    return self.session_store.get_session()

  def get_user_from_session(self):
    """Convenience method for retrieving the users crendentials from an
    authenticated session.
    """
    google_user_id = self.session.get(self.CURRENT_USER_SESSION_KEY)
    if google_user_id is None:
      raise UserNotAuthorizedException('Session did not contain user id.')
    user = model.User.all().filter('google_user_id =', google_user_id).get()
    if not user:
      raise UserNotAuthorizedException(
        'Session user ID could not be found in the datastore.')
    return user

class UserNotAuthorizedException(Exception):
  msg = 'Unauthorized request.'

class NotFoundException(Exception):
  msg = 'Resource not found.'

class RevokeException(Exception):
  msg = 'Failed to revoke token for given user.'


class JsonRestHandler(webapp2.RequestHandler):
  """Base RequestHandler type which provides convenience methods for writing
  JSON HTTP responses.
  """
  JSON_MIMETYPE = "application/json"

  def send_error(self, code, message):
    """Convenience method to format an HTTP error response in a standard format.
    """
    self.response.set_status(code, message)
    self.response.out.write(message)
    return

  def send_success(self, obj=None, jsonkind='photohunt#unknown'):
    """Convenience method to format a photohunt JSON HTTP response in a standard
    format.
    """
    self.response.headers["Content-Type"] = self.JSON_MIMETYPE
    if obj is not None:
      if isinstance(obj, basestring):
        self.response.out.write(obj)
      else:
        self.response.out.write(json.dumps(obj, cls=model.JsonifiableEncoder))


