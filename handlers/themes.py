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

"""ThemesHandler"""

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

from handlers.session import JsonRestHandler

class ThemesHandler(JsonRestHandler):
  """Provides an API for working with Themes.

  This handler provides the /api/themes end-point, and exposes the following
  operations:
    GET /api/themes
  """

  def get(self):
    """Exposed as `GET /api/themes`.

    When requested, if no theme exists for the current day, then a theme with
    the name of 'Beautiful' is created for today.  This leads to multiple
    themes with the name 'Beautiful' if you use the app over multiple days
    without changing this logic.  This behavior is purposeful so that the app
    is easier to get up and running.

    Returns the following JSON response representing a list of Themes.

    [
      {
        'id':0,
        'displayName':'',
        'created':0,
        'start':0
      },
      ...
    ]
    """
    themes = list(model.Theme.all().order('-start').run())
    if not themes:
      default_theme = model.Theme(display_name="Beautiful")
      default_theme.start = default_theme.created
      default_theme.put()
      themes = [default_theme]
    self.send_success(themes, jsonkind="photohunt#themes")
