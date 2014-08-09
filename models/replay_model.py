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

"""Model sc2 game events"""

import json
import logging
import random
import re
import string
import datetime
import types
import model
# from model import Jsonifiable

import sc2reader
from sc2reader.factories import SC2Factory

class ReplayModel():
  """Represents the sc2 json feed of replay game events."""
  jsonkind = 'photohunt#replay'
  # default_replay = 'swarms.SC2Replay'
  """
  replays_events = sc2reader.load_replay('static/replays/swarms.SC2Replay', load_level=4)
  """
  # replays_events = sc2reader.load_replay('sc2reader/swarms.SC2Replay')
  # sc2 = SC2Factory()
  # replay = sc2.load_replay('sc2reader/swarms.SC2Replay')
  # resplay_json = sc2json('swarms.SC2Replay')
  # default_replay = 'hello b' # sc2json
  #sc2 = SC2Factory()
  #default_replay = sc2.load_replay('static/replays/sample.SC2Replay', load_level=4)
  #default_replay_json = JsonifiableEncoder(default_replay)
  # default_replay_json = jsonEncoder.to_json()
  sc2 = SC2Factory()
  bSample = 'False'
  selectReplayPath = ''
  
  if bSample == 'False':
    selectReplayPath = 'static/replays/fenner.SC2Replay'
  else:
    selectReplayPath = 'static/replays/sample.SC2Replay'

  default_replay = sc2.load_replay(selectReplayPath, load_level=4)
  print(default_replay)
  #default_replay_json = sc2json.jsonEncode('static/replays/sample.SC2Replay')
  

