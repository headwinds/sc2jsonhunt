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

"""ReplayHandler"""

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

from models.replay_model import ReplayModel

import sc2reader
from sc2reader.events.game import GameEvent
from sc2reader.events.message import ProgressEvent
from sc2reader.events.game import SelectionEvent

from handlers.session import SessionEnabledHandler
from handlers.session import UserNotAuthorizedException
from handlers.session import NotFoundException
from handlers.session import RevokeException
from handlers.session import JsonRestHandler

class ReplayHandler(JsonRestHandler, SessionEnabledHandler):


  """Provides an API for working with Replays.

  This handler provides the /api/replays end-point, and exposes the following
  operations:
    GET /api/replays
  """

  def get(self):
    """Exposed as `GET /api/replays`.

    When requested, send the default replay game events. 

    Returns the following JSON response representing a list of Replay game events.

    [
      {
        'id':0,
        'displayName':'',
        'created':0,
        'start':0
      },
      ...
    ]
    replay_events = model.Replay.replay_events;
    self.send_success(replay_events, jsonkind="photohunt#replay")  
    """
    default_replay = ReplayModel.default_replay;
    # default_replay_json = model.Replay.json_properties(default_replay);
    # print(default_replay)
    loopBreak = 0
    result = {}
    game_events = default_replay.players[0].events
    playerPID = default_replay.players[0].pid
    for game_event in game_events:
      #default_replay_str = str(game_event)
      #gameEventObj = GameEvent(game_event, playerPID)
      # gameEventObj = type("SimpleObject", (object,), {})()
      #for prop in aGameEvent:
      #  gameEventObj[prop] = prop
      # game_event is a ProgressEvent containing time, player, event like 00.18 Fenner          GetControlGroupEvent
      #for prop in game_event:
      myTypeTest = isinstance(game_event, GameEvent) # starting to filter out the events I want...
            
      if str(myTypeTest) == "True":
        gameEventObj = type("SimpleObject", (object,), {})()
        #for prop in game_event:
        gameEventObj.name = str(game_event.name)
        gameEventObj.player = str(game_event.player)
        gameEventObj.frame = str(game_event.frame)
        gameEventObj.second = str(game_event.second)
        #gameEventObj.frame = game_event.frame
        #gameEventObj.event = game_event.event 
        gameObjStr = "name: " +  gameEventObj.name + ", player: " +  gameEventObj.player + ", frame: " + gameEventObj.frame + ", second: " + gameEventObj.second
        result[str(loopBreak)] = gameObjStr #json.dumps(game_event)
      
      loopBreak += 1
      if loopBreak > 10: # approx 4 mins of game time - I want to pass start time to get events on demand 
        break
    self.send_success(json.dumps(result), jsonkind="photohunt#replay")  

