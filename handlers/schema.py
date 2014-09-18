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

"""SchemaHandler"""

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

class SchemaHandler(JsonRestHandler, SessionEnabledHandler):
  """Returns metadata for an image for user when writing moments."""

  def get(self):
    """Returns the template at templates/${request.path}.

       Issues the following errors along with corresponding HTTP response codes:
       404: 'Not Found'. No template was found for the specified path.
    """
    try:
      photo_id = self.request.get('photoId')
      self.response.headers['Content-Type'] = 'text/html'
      template = jinja_environment.get_template('templates' + self.request.path)
      if photo_id:
        photo = model.Photo.get_by_id(long(photo_id))
        self.response.out.write(template.render({
          'photoId': photo_id,
          'redirectUrl': 'index.html?photoId={}'.format(photo_id),
          'name': 'Photo by {} for {} | photohunt'.format(
              photo.owner_display_name,
              photo.theme_display_name),
          'imageUrl': photo.thumbnail_url,
          'description': '{} needs your vote to win this hunt.'.format(
              photo.owner_display_name)
        }))
      else:
        photo = model.Photo.all().get()
        if photo:
          self.response.out.write(template.render({
            'redirectUrl': 'index.html?photoId='.format(photo_id),
            'name': 'Photo by {} for {} | photohunt'.format(
                photo.owner_display_name,
                photo.theme_display_name),
            'imageUrl': photo.thumbnail_url,
            'description': 'Join in the photohunt game.'
          }))
        else:
          self.response.out.write(template.render({
            'redirectUrl': get_base_url(),
            'name': 'photohunt',
            'imageUrl': '{}/images/interactivepost-icon.png'.format(
                get_base_url()),
            'description': 'Join in the photohunt game.'
          }))
    except TypeError as te:
      self.send_error(404, "Resource not found")