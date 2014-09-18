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

"""ConnectHandler"""

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

class ConnectHandler(JsonRestHandler, SessionEnabledHandler):
  """Provides an API to connect users to photohunt.

  This handler provides the api/connect end-point, and exposes the following
  operations:
    POST /api/connect
  """

  @staticmethod
  def exchange_code(code):
    """Exchanges the `code` member of the given AccessToken object, and returns
    the relevant credentials.

    Args:
      code: authorization code to exchange.

    Returns:
      Credentials response from Google indicating token information.

    Raises:
      FlowExchangeException Failed to exchange code (code invalid).
    """
    oauth_flow = flow_from_clientsecrets('client_secrets.json',
      scope=' '.join(SCOPES))
    oauth_flow.request_visible_actions = ' '.join(VISIBLE_ACTIONS)
    oauth_flow.redirect_uri = 'postmessage'
    credentials = oauth_flow.step2_exchange(code)
    return credentials

  @staticmethod
  def get_token_info(credentials):
    """Get the token information from Google for the given credentials."""
    url = (TOKEN_INFO_ENDPOINT
           % credentials.access_token)
    return urlfetch.fetch(url)

  @staticmethod
  def get_user_profile(credentials):
    """Return the public Google+ profile data for the given user."""
    http = httplib2.Http()
    plus = build('plus', 'v1', http=http)
    credentials.authorize(http)
    return plus.people().get(userId='me').execute()

  @staticmethod
  def save_token_for_user(google_user_id, credentials):
    """Creates a user for the given ID and credential or updates the existing
    user with the existing credential.

    Args:
      google_user_id: Google user ID to update.
      credentials: Credential to set for the user.

    Returns:
      Updated User.
    """
    user = model.User.all().filter('google_user_id =', google_user_id).get()
    if user is None:
      # Couldn't find User in datastore.  Register a new user.
      profile = ConnectHandler.get_user_profile(credentials)
      user = model.User()
      user.google_user_id = profile.get('id')
      user.google_display_name = profile.get('displayName')
      user.google_public_profile_url = profile.get('url')
      image = profile.get('image')
      if image is not None:
        user.google_public_profile_photo_url = image.get('url')
    user.google_credentials = credentials
    user.put()
    return user

  @staticmethod
  def create_credentials(connect_credentials):
    """Creates oauth2client credentials from those supplied in a connect
    request.
    """
    # In this flow, the user is connecting without a refresh token.  This
    # credential will be good for an hour.
    refresh_token = ''
    _, client_info = oauth2client.clientsecrets.loadfile(
        'client_secrets.json', None)
    web_flow = flow_from_clientsecrets(
        'client_secrets.json', scope=' '.join(SCOPES))
    web_flow.request_visible_actions = ' '.join(VISIBLE_ACTIONS)
    web_flow.redirect_uri = 'postmessage'
    credentials = oauth2client.client.OAuth2Credentials(
        access_token=connect_credentials.get('access_token'),
        client_id=client_info.get('client_id'),
        client_secret=client_info['client_secret'],
        refresh_token=refresh_token,
        token_expiry=connect_credentials.get('expires_at'),
        token_uri=web_flow.token_uri,
        user_agent=web_flow.user_agent,
        id_token=connect_credentials.get('id_token'))
    return credentials

  @staticmethod
  def get_and_store_friends(user):
    """Query Google for the list of the user's friends that they've shared with
    our app, and then store those friends for later use.

    Args:
      user: User to get friends for.
    """

    # Delete the friends for the given user first.
    edges = model.DirectedUserToUserEdge.all().filter(
        'owner_user_id = ', user.key().id()).run()
    db.delete(edges)

    http = httplib2.Http()
    plus = build('plus', 'v1', http=http)
    user.google_credentials.authorize(http)
    friends = plus.people().list(userId='me', collection='visible').execute()
    for google_friend in friends.get('items'):
      # Determine if the friend from Google is a user of our app
      friend = model.User.all().filter('google_user_id = ',
          google_friend.get('id')).get()
      # Only store edges for friends who are users of our app
      if friend is not None:
        edge = model.DirectedUserToUserEdge()
        edge.owner_user_id = user.key().id()
        edge.friend_user_id = friend.key().id()
        edge.put()

  def post(self):
    """Exposed as `POST /api/connect`.

    Takes the following payload in the request body.  The payload represents
    all of the parameters that are required to authorize and connect the user
    to the app.
    {
      'state':'',
      'access_token':'',
      'token_type':'',
      'expires_in':'',
      'code':'',
      'id_token':'',
      'authuser':'',
      'session_state':'',
      'prompt':'',
      'client_id':'',
      'scope':'',
      'g_user_cookie_policy':'',
      'cookie_policy':'',
      'issued_at':'',
      'expires_at':'',
      'g-oauth-window':''
    }

    Returns the following JSON response representing the User that was
    connected:
    {
      'id':0,
      'googleUserId':'',
      'googleDisplayName':'',
      'googlePublicProfileUrl':'',
      'googlePublicProfilePhotoUrl':'',
      'googleExpiresAt':0
    }

    Issues the following errors along with corresponding HTTP response codes:
    401: The error from the Google token verification end point.
    500: 'Failed to upgrade the authorization code.' This can happen during
         OAuth v2 code exchange flows.
    500: 'Failed to read token data from Google.'
         This response also sends the error from the token verification
         response concatenated to the error message.
    500: 'Failed to query the Google+ API: '
         This error also includes the error from the client library
         concatenated to the error response.
    500: 'IOException occurred.' The IOException could happen when any
         IO-related errors occur such as network connectivity loss or local
         file-related errors.
    """
    # Only connect a user that is not already connected.
    if self.session.get(self.CURRENT_USER_SESSION_KEY) is not None:
      user = self.get_user_from_session()
      self.send_success(user)
      return

    credentials = None
    try:
      connect_credentials = json.loads(self.request.body)
      if 'error' in connect_credentials:
        self.send_error(401, connect_credentials.error)
        return
      if connect_credentials.get('code'):
        credentials = ConnectHandler.exchange_code(
            connect_credentials.get('code'))
      elif connect_credentials.get('access_token'):
        credentials = ConnectHandler.create_credentials(connect_credentials)
    except FlowExchangeError:
      self.send_error(401, 'Failed to exchange the authorization code.')
      return

    # Check that the token is valid and gather some other information.
    token_info = ConnectHandler.get_token_info(credentials)
    if token_info.status_code != 200:
      self.send_error(401, 'Failed to validate access token.')
      return
    logging.debug("TokenInfo: " + token_info.content)
    token_info = json.loads(token_info.content)
    # If there was an error in the token info, abort.
    if token_info.get('error') is not None:
      self.send_error(401, token_info.get('error'))
      return
    # Make sure the token we got is for our app.
    expr = re.compile("(\d*)(.*).apps.googleusercontent.com")
    issued_to_match = expr.match(token_info.get('issued_to'))
    local_id_match = expr.match(CLIENT_ID)
    if (not issued_to_match
        or not local_id_match
        or issued_to_match.group(1) != local_id_match.group(1)):
      self.send_error(401, "Token's client ID does not match app's.")
      return

    # Store our credentials with in the datastore with our user.
    user = ConnectHandler.save_token_for_user(token_info.get('user_id'),
                                              credentials)

    # Fetch the friends for this user from Google, and save them.
    ConnectHandler.get_and_store_friends(user)

    # Store the user ID in the session for later use.
    self.session[self.CURRENT_USER_SESSION_KEY] = token_info.get('user_id')

    self.send_success(user)


class DisconnectHandler(JsonRestHandler, SessionEnabledHandler):
  """Provides an API to disconnect users from photohunt.

  This handler provides the /api/disconnect endpoint, and exposes the following
  operations:
    POST /api/disconnect
  """

  @staticmethod
  def revoke_token(credentials):
    """Revoke the given access token, and consequently any other access tokens
    and refresh tokens issued for this user to this app.

    Essentially this operation disconnects a user from the app, but keeps
    their app activities alive in Google.  The same user can later come back
    to the app, sign-in, re-consent, and resume using the app.
    throws RevokeException error occured while making request.
    """
    url = TOKEN_REVOKE_ENDPOINT % credentials.access_token
    http = httplib2.Http()
    credentials.authorize(http)
    result = http.request(url, 'GET')[0]

    if result['status'] != '200':
      raise RevokeException

  def post(self):
    """Exposed as `POST /api/disconnect`.

    As required by the Google+ Platform Terms of Service, this end-point:

      1. Deletes all data retrieved from Google that is stored in our app.
      2. Revokes all of the user's tokens issued to this app.

    Takes no request payload, and disconnects the user currently identified
    by their session.

    Returns the following JSON response representing the User that was
    connected:

      'Successfully disconnected.'

    Issues the following errors along with corresponding HTTP response codes:
    401: 'Unauthorized request'.  No user was connected to disconnect.
    500: 'Failed to revoke token for given user: '
         + error from failed connection to revoke end-point.
    """
    try:
      user = self.get_user_from_session()
      credentials = user.google_credentials

      del(self.session[self.CURRENT_USER_SESSION_KEY])
      user_id = user.key().id()
      db.delete(model.Vote.all().filter("owner_user_id =", user_id).run())
      db.delete(model.Photo.all().filter("owner_user_id =", user_id).run())
      db.delete(model.DirectedUserToUserEdge.all().filter(
          "owner_user_id =", user_id).run())
      db.delete(user)

      DisconnectHandler.revoke_token(credentials)
      self.send_success('Successfully disconnected.')
      return
    except UserNotAuthorizedException as e:
      self.send_error(401, e.msg)
      return
    except RevokeException as e:
      self.send_error(500, e.msg)
      return
