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

import pprint
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
from sc2reader.events.game import CommandEvent

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
    player1_loopBreak = 0
    player2_loopBreak = 0
    
    #player1_result = {}
    #player2_result = {}
    pp = pprint.PrettyPrinter(indent=4)

    #result = { 'player1': player1_result, 'player2': player2_result}
    result = {}
  
    player1_game_events = default_replay.players[0].events 
    player2_game_events = default_replay.players[1].events 

    player1_playerPID = default_replay.players[0].pid
    player2_playerPID = default_replay.players[1].pid

    for player1_game_event in player1_game_events:
      #default_replay_str = str(game_event)
      #gameEventObj = GameEvent(game_event, playerPID)
      # gameEventObj = type("SimpleObject", (object,), {})()
      #for prop in aGameEvent:
      #  gameEventObj[prop] = prop
      # game_event is a ProgressEvent containing time, player, event like 00.18 Fenner          GetControlGroupEvent
      #for prop in player1_game_event:
      #myTypeTest = isinstance(player1_game_event, GameEvent) # starting to filter out the events I want...
      myTypeTest = isinstance(player1_game_event, CommandEvent) # starting to filter out the events I want... remember to import the event type!
      """ 
      ['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__hash__', '__init__', 
      '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', 
      '__subclasshook__', '__weakref__', '_str_prefix', 
      'ability', 'ability_data', 
      'ability_id', 'ability_link', 
      'ability_name', 
      'ability_type', 
      'ability_type_data', 'command_index', 'flag', 
      'flags', 'frame', 'has_ability', 'is_local', 'logger', 
      'name', 'other_unit', 
      'other_unit_id', 
      'pid', 
      'player', 
      'second']
      """
            
      if str(myTypeTest) == "True" and str(player1_game_event.name) == "BasicCommandEvent":
        player1_gameEventObj = type("SimpleObject", (object,), {})()
        #for prop in game_event:
        player1_gameEventObj.name = str(player1_game_event.name)
        player1_gameEventObj.player = str(player1_game_event.player)
        player1_gameEventObj.frame = str(player1_game_event.frame)
        player1_gameEventObj.second = str(player1_game_event.second)
        player1_gameEventObj.ability_name = str(player1_game_event.ability_name)
        player1_gameEventObj.ability_data = str(player1_game_event.ability_data)
        #for prop in player1_game_event:
        #  print(prop)
        #print( dir(player1_game_event) ) print all the properties of the class
        
        #pp.pprint(player1_game_event)
        #gameEventObj.frame = game_event.frame
        #gameEventObj.event = game_event.event 
        #print(str(player1_game_event))
        #if player1_gameEventObj.name != "UserOptionsEvent"
        #  for prop in player1_game_event:
        #    print(prop)
        player1_gameObjStr = "name: " +  player1_gameEventObj.name + ", player1: " +  player1_gameEventObj.player + ", frame: " + player1_gameEventObj.frame + ", second: " + player1_gameEventObj.second + ", ability_name: " + player1_gameEventObj.ability_name + ", ability_data: " + player1_gameEventObj.ability_data
        result[str(player1_loopBreak)] = player1_gameObjStr #json.dumps(game_event)
      
      player1_loopBreak += 1
      if player1_loopBreak > 200: # approx 2 mins of game time - I want to pass start time to get events on demand 
        break

    for player2_game_event in player2_game_events:
      #default_replay_str = str(game_event)
      #gameEventObj = GameEvent(game_event, playerPID)
      # gameEventObj = type("SimpleObject", (object,), {})()
      #for prop in aGameEvent:
      #  gameEventObj[prop] = prop
      # game_event is a ProgressEvent containing time, player, event like 00.18 Fenner          GetControlGroupEvent
      #for prop in game_event:
      myTypeTest = isinstance(player2_game_event, GameEvent) # starting to filter out the events I want...
            
      if str(myTypeTest) == "True" and str(player2_game_event.name) == "BasicCommandEvent":
        player2_gameEventObj = type("SimpleObject", (object,), {})()
        #for prop in game_event:
        player2_gameEventObj.name = str(player2_game_event.name)
        player2_gameEventObj.player = str(player2_game_event.player)
        player2_gameEventObj.frame = str(player2_game_event.frame)
        player2_gameEventObj.second = str(player2_game_event.second)
        player2_gameEventObj.ability_name = str(player2_game_event.ability_name)
        player2_gameEventObj.ability_data = str(player2_game_event.ability_data)
        #gameEventObj.frame = game_event.frame
        #gameEventObj.event = game_event.event 
        print(str(player2_game_event))
        player2_gameObjStr = "name: " +  player2_gameEventObj.name + ", player2: " +  player2_gameEventObj.player + ", frame: " + player2_gameEventObj.frame + ", second: " + player2_gameEventObj.second + ", ability_name: " + player2_gameEventObj.ability_name + ", ability_data: " + player2_gameEventObj.ability_data
        result[str(player2_loopBreak + 200)] = player2_gameObjStr #json.dumps(game_event)
      
      player2_loopBreak += 1
      if player2_loopBreak > 200: # approx 2 mins of game time - I want to pass start time to get events on demand 
        break  

      #result.player1 = player1_result 
      #result.player2 = player2_result 

    self.send_success(json.dumps(result), jsonkind="photohunt#replay")  

