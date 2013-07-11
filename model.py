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

"""Persistent datamodel for PhotoHunt."""

import json
import logging
import random
import re
import string
import datetime
import types
import handlers
from apiclient.discovery import build
from google.appengine.api import images

from google.appengine.ext import db
from google.appengine.ext import blobstore
from oauth2client.appengine import CredentialsProperty

class JsonifiableEncoder(json.JSONEncoder):
  """JSON encoder which provides a convenient extension point for custom JSON
  encoding of Jsonifiable subclasses.
  """
  def default(self, obj):
    if isinstance(obj, Jsonifiable):
      result = json.loads(obj.to_json())
      return result
    return json.JSONEncoder.default(self, obj)

class Jsonifiable:
  """Base class providing convenient JSON serialization and deserialization
  methods.
  """
  jsonkind = 'photohunt#jsonifiable'

  @staticmethod
  def lower_first(key):
    """Make the first letter of a string lower case."""
    return key[:1].lower() + key[1:] if key else ''

  @staticmethod
  def transform_to_camelcase(key):
    """Transform a string underscore separated words to concatenated camel case.
    """
    return Jsonifiable.lower_first(
        ''.join(c.capitalize() or '_' for c in key.split('_')))

  @staticmethod
  def transform_from_camelcase(key):
    """Tranform a string from concatenated camel case to underscore separated
    words.
    """
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', key)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

  def to_dict(self):
    """Returns a dictionary containing property values for the current object
    stored under the property name in camel case form.
    """
    result = {}
    for p in self.json_properties():
      value = getattr(self, p)
      if isinstance(value, datetime.datetime):
        value = value.strftime('%s%f')[:-3]
      result[Jsonifiable.transform_to_camelcase(p)] = value
    return result

  def to_json(self):
    """Returns a JSON string of the properties of this object."""
    properties = self.to_dict()
    if isinstance(self, db.Model):
      properties['id'] = unicode(self.key().id())
    return json.dumps(properties)

  def json_properties(self):
    """Returns a default list properties for this object that should be
    included when serializing this object to, or deserializing it from, JSON.

    Subclasses can customize the properties by overriding this method.
    """
    attributes = []
    all = vars(self)
    for var in all:
      if var[:1] != '_':
        attributes.append(var)
    if isinstance(self, db.Model):
      properties = self.properties().keys()
      for property in properties:
        if property[:1] != '_':
          attributes.append(property)
    return attributes

  def from_json(self, json_string):
    """Sets properties on this object based on the JSON string supplied."""
    o = json.loads(json_string)
    properties = {}
    if isinstance(self, db.Model):
      properties = self.properties()
    for key, value in o.iteritems():
      property_value = value
      property_key = Jsonifiable.transform_from_camelcase(key)
      if property_key in properties.keys():
        if properties[property_key].data_type == types.IntType:
          property_value = int(value)
      self.__setattr__(property_key, property_value)


class DirectedUserToUserEdge(db.Model, Jsonifiable):
  """Represents friend links between PhotoHunt users."""
  owner_user_id = db.IntegerProperty()
  friend_user_id = db.IntegerProperty()


class Photo(db.Model, Jsonifiable):
  """Represents a user submitted Photo."""
  jsonkind = 'photohunt#photo'
  DEFAULT_THUMBNAIL_SIZE = 400
  fullsize_url = None
  thumbnail_url = None
  vote_cta_url = None
  photo_content_url = None
  num_votes = None
  voted = False

  owner_user_id = db.IntegerProperty()
  owner_display_name = db.StringProperty()
  owner_profile_url = db.StringProperty()
  owner_profile_photo = db.StringProperty()
  theme_id = db.IntegerProperty()
  theme_display_name = db.StringProperty()
  image_blob_key = blobstore.BlobReferenceProperty()
  created = db.DateTimeProperty(auto_now_add=True)

  def __init__(self, *args, **kwargs):
    db.Model.__init__(self, *args, **kwargs)
    self._setup()

  def put(self, **kwargs):
    db.Model.put(self, **kwargs)
    self._setup()

  def _setup(self):
    """Populate transient fields after load or initialization."""
    if self.image_blob_key:
      self.fullsize_url = self.get_image_url()
      self.thumbnail_url = self.get_image_url(self.DEFAULT_THUMBNAIL_SIZE)
    if self.is_saved():
      key = self.key()
      self.num_votes = Vote.all().filter("photo_id =", key.id()).count()
      template = '%s/index.html?photoId=%s%s'
      self.vote_cta_url = template % (
          handlers.get_base_url(), key.id(), '&action=VOTE')
      template = '%s/photo.html?photoId=%s'
      self.photo_content_url = template % (
          handlers.get_base_url(), key.id())
    else:
      self.num_votes = 0

  def json_properties(self):
    """Hide image_blob_key from JSON serialization."""
    properties = Jsonifiable.json_properties(self)
    properties.remove('image_blob_key')
    return properties

  def get_image_url(self, size=None):
    """Return the image serving url for this Photo."""
    return images.get_serving_url(self.image_blob_key, size=size)

class Theme(db.Model, Jsonifiable):
  """Represents a PhotoHunt theme."""
  jsonkind = 'photohunt#theme'
  display_name = db.StringProperty()
  created = db.DateTimeProperty(auto_now_add=True)
  start = db.DateTimeProperty()
  preview_photo_id = db.IntegerProperty()

  @staticmethod
  def get_current_theme():
    """Query the current theme based on the date."""
    today = db.datetime.date.today()
    start = db.datetime.datetime(today.year, today.month, today.day, 0, 0, 0)
    end = db.datetime.datetime(today.year, today.month, today.day, 23, 59, 59)
    return Theme.all().filter('start >=', start).filter(
        'start <', end).order('-start').get()

class User(db.Model, Jsonifiable):
  """Represents a PhotoHunt user."""
  jsonkind = 'photohunt#user'
  email = db.EmailProperty()
  google_user_id = db.StringProperty()
  google_display_name = db.StringProperty()
  google_public_profile_url = db.LinkProperty()
  google_public_profile_photo_url = db.LinkProperty()
  google_credentials = CredentialsProperty()

  def json_properties(self):
    """Hide google_credentials from JSON serialization."""
    properties = Jsonifiable.json_properties(self)
    properties.remove('google_credentials')
    return properties

  def get_friends(self):
    """Query the friends of the current user."""
    edges = DirectedUserToUserEdge.all().filter(
        'owner_user_id =', self.key().id()).run()
    return db.get([db.Key.from_path('User', edge.friend_user_id) for edge in
                   edges])

class Vote(db.Model, Jsonifiable):
  """Represents a vote case by a PhotoHunt user."""
  jsonkind = 'photohunt#vote'
  owner_user_id = db.IntegerProperty()
  photo_id = db.IntegerProperty()

class Message(Jsonifiable):
  """Standard JSON type used to return success/error messages."""
  jsonkind = 'photohunt#message'
  message = ""

  def __init__(self, message):
    self.message = message

class UploadUrl(Jsonifiable):
  """Represents a PhotoHunt Upload URL."""
  jsonkind = 'photohunt#uploadurl'
  url = ""

  def __init__(self, url):
    self.url = url
