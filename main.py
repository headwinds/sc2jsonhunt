#!/usr/bin/env python
# -*- coding: utf-8 -*-
#   
#       This program is free software; you can redistribute it and/or modify
#       it under the terms of the GNU General Public License as published by
#       the Free Software Foundation; either version 2 of the License, or
#       (at your option) any later version.
#       
#       This program is distributed in the hope that it will be useful,
#       but WITHOUT ANY WARRANTY; without even the implied warranty of
#       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#       GNU General Public License for more details.
#       
#       You should have received a copy of the GNU General Public License
#       along with this program; if not, write to the Free Software
#       Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#       MA 02110-1301, USA.

"""The main file to start the application."""

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

import handlers
from handlers.connect import ConnectHandler
from handlers.connect import DisconnectHandler
from handlers.themes import ThemesHandler
from handlers.replay import ReplayHandler
from handlers.friends import FriendsHandler
from handlers.image import ImageHandler
from handlers.votes import VotesHandler
from handlers.image import PhotosHandler
from handlers.schema import SchemaHandler

from handlers.session import SessionEnabledHandler
from handlers.session import UserNotAuthorizedException
from handlers.session import NotFoundException
from handlers.session import RevokeException
from handlers.session import JsonRestHandler


jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']

SCOPES = [
    'https://www.googleapis.com/auth/plus.login'
]

VISIBLE_ACTIONS = [
    'http://schemas.google.com/AddActivity',
    'http://schemas.google.com/ReviewActivity'
]

TOKEN_INFO_ENDPOINT = ('https://www.googleapis.com/oauth2/v1/tokeninfo' +
    '?access_token=%s')
TOKEN_REVOKE_ENDPOINT = 'https://accounts.google.com/o/oauth2/revoke?token=%s'


def get_base_url():
  """Returns the base URL for this application."""
  base = get_default_version_hostname()
  if "appspot.com" in base:
    return "https://%s" % base
  return "http://%s" % base

routes = [
    ('/api/connect', ConnectHandler),
    ('/api/disconnect', DisconnectHandler),
    ('/api/themes', ThemesHandler),
    ('/api/replay', ReplayHandler),
    ('/api/friends', FriendsHandler),
    ('/api/images', ImageHandler),
    ('/api/votes', VotesHandler),
    ('/api/photos', PhotosHandler),
    ('/photo.html', SchemaHandler),
    ('/invite.html', SchemaHandler)]
config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'YOUR_SESSION_SECRET'
}
app = webapp2.WSGIApplication(routes, config=config, debug=True)
