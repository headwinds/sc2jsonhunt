# sc2jsonhunt

#### challenge

I want to be able to take an Starcraft 2 replay file and produce to json dump of all the game events which I can use in my javascript experiments. I'm planning to use the events to possibly create a game where you need to guess the next event based on what's happening to help you make better decisions and improve build order recall. Should I drone or produce units? What did [Jaedong](http://wcs.battle.net/sc2/en/players/jaedong) do?

#### log

As I tackled this challenge, I jotted down the various paths and forks that I went down. It began with a google search for "sc2 replay javascript".
 
My first tripple [fork](http://gamedev.stackexchange.com/questions/10622/parsing-sc2replay-files)

[phpsc2replay](https://code.google.com/p/phpsc2replay/)
[WARP - java](http://trac.erichseifert.de/warp)
[python](https://github.com/GraylinKim/sc2reader)

Do use I PHP, Java, or Python? I choose Python. Python is a language which I've tried to learn in the past without a lot of success mainly because I didn't have a real goal beyond knowing that language was powerful and both scientists and gamer developers were fond of it. Ideally, I would have liked to start with a NodeJS project but would have been too easy. 

I spent some going through the github issues on sc2reader and made a comment [here](https://github.com/GraylinKim/sc2reader/pull/157#issuecomment-33798486) and [here](https://github.com/GraylinKim/sc2reader/issues/117#issuecomment-33713400). Possessing the start of a json branch was a good sign that this was the right project for me to investigate further. Perhaps, I could dive in and help finish it hoping that it probably far along and might need a little push.   

After I pulled down the sc2reader source, I open the terminal and located the scripts folder:

$ cd sc2reader/scripts 

#### sc2replay files

On a Mac, right click on the file in SC2 and a context menu will appear where you can find the file on your computer. 

![sc2replay screenshot](http://sc2jsonhunt.appspot.com/images/replays.png)

For some reason, finder fails...

I copy n pasted one of my replays into this folder so that it was easy to find without a long path and typed: 

$ python sc2json.py "swarms.SC2Replay"

This produced a messy json dump and copy and pasted it into this [jsonformatter](http://jsonformatter.curiousconcept.com/). Thus, I could better read the data:

'
{
   "is_ladder":true,
   "file_time":null,
   "real_type":"1v1",
   "frames":55339,
   "speed":"Faster",
   "gateway":"us",
   "category":"Ladder",
   "filehash":"d6f84236e91cac24cc0aaf106f209b4c38d9a527a47a12c8b3917723e9cd79cd",
   "filename":"swarms.SC2Replay",
   "build":29261,
   "game_length":3458,
   "unix_timestamp":1396458812,
   "type":"1v1",
   "real_length":2470,
   "observers":[

   ],
   "map_name":"Heavy Rain LE",
   "game_fps":16.0,
   "date":"2014-04-02 17:13:32",
   "utc_date":null,
   "is_private":false,
   "versions":[
      1,
      2,
      1,
      1,
      29261,
      28667
   ],
   "time_zone":-3.9999999998333333,
   "players":[
      {
         "uid":0,
         "play_race":"Terran",
         "handicap":100,
         "pick_race":"Terran",
         "pid":1,
         "result":"Loss",
         "name":"ubik",
         "url":"http://us.battle.net/sc2/en/profile/4950281/1/ubik/",
         "messages":[

         ],
         "color":{
            "a":255,
            "r":180,
            "b":30,
            "name":"Red",
            "g":20
         },
         "type":null,
         "avg_apm":null
      },
      {
         "uid":1,
         "play_race":"Zerg",
         "handicap":100,
         "pick_race":"Zerg",
         "pid":2,
         "result":"Win",
         "name":"headwinds",
         "url":"http://us.battle.net/sc2/en/profile/2120254/1/headwinds/",
         "messages":[

         ],
         "color":{
            "a":255,
            "r":0,
            "b":255,
            "name":"Blue",
            "g":66
         },
         "type":null,
         "avg_apm":null
      }
   ],
   "release":"2.1.1.29261"
}
'

But wait? Where are all the game events? This is just a overall summary of the game results. 

Next I tried:

$ python sc2replayer.py "swarms.SC2Replay" 

In this game, I really struggled to defeat swarms of spider mines, throwing ultralisks at them without overseer support was not a good idea. It took me awhile to sort out the overseer with hyrda sniper support to finally clean them up. 

Without looking at the instructions, I had a hunch that I needed to push the arrow key. I actually could have hit any key. And voila, as I hit the arrow, there were the game events as they happened. 


1v1 on Heavy Rain LE at 2014-04-02 16:32:22

Team 1: Player 1 - ubik (Terran)
  Player 1 - ubik (Terran)
Team 2: Player 2 - headwinds (Zerg)
  Player 2 - headwinds (Zerg)

--------------------------


00.01	ubik            SelectionEvent['OrbitalCommandFlying [2700001]']
00.01	ubik            Ability (1260) - TrainSCV
00.02	headwinds       SelectionEvent['Larva [2900001]', 'Larva [2940001]', 'Larva [2980001]']
00.02	headwinds       Ability (1720) - MorphDrone
00.02	headwinds       Ability (1720) - MorphDrone
00.02	headwinds       SelectionEvent['Larva [2900001]']
00.03	headwinds       SelectionEvent['Hive [28C0001]']
00.04	headwinds       SelectionEvent['Larva [2940001]', 'Larva [2980001]']
00.06	ubik            Right Click; Target: MineralField [00400001]; Location: (53.0, 145.5, 49136)
00.06	headwinds       SelectionEvent['Hive [28C0001]']

Great! This is exactly what I want to expose to my javascript app. So how I could create a service from Python that Javascript can hook into and read these events? I knew I need to create an API to this data. I also knew that the Google App Engine could host Java and Python projects for free. I already had it installed and had fooled around with it a year ago. Now it was time to dust it off and try again with new motivation. 

I started to create a sample project from the developer console but this turned out to be the wrong fork in the path for me. I thought the mobile starter backend would suffice but it was a bit too confusing for me since it started with Java and then suggested you could change to a [different backend module](https://developers.google.com/appengine/docs/python/backends/ ). 

I decide to google other sample projects and quickly discovered [google cloud platform](http://googlecloudplatform.github.io/).

From the menu, I selected Language then Python and dug through the examples settling on the [Photo Hunt](https://developers.google.com/+/photohunt/python) sample since it had both Python and Angular. I was already comfortable developing in Angular so this kept Python as the main obstacle. 

I followed the excellent detailed instructions on how to install the Photo Hunt project. Back in the [Google Developer console](https://console.developers.google.com/project), I created new projected and named it:  
sc2jsonhunt. I entered the following: 

Credentials

Authorized JavaScript origins
http://sc2jsonhunt.appspot.com/
http://localhost:8080/

Authorized redirect URI
http://sc2jsonhunt.appspot.com/oauth2callback
http://localhost:8080/oauth2callback

Then, in the terminal, I wanted to run the project so, as instructed, I went to the folder containing gplus-photohunt-server-python and typed: 

$ dev_appserver.py gplus-photohunt-server-python

All good! I can see the app on my local machine http://localhost:8080/. 

![sc2replay screenshot](http://sc2jsonhunt.appspot.com/images/replays/photohunt.png)

This is an exciting moment realizing that I have a running python angular app. Now, it shouldn't too difficult to add the sc2reader source. At this point, I could nearly see the solution and definitely believed that I could accomplish it within perhaps a few more hours or two mornings. I try to spend an hour each morning on hacker projects. For me, that makes's it sustainable and fun. 

So I had a locally running angular python app but ultimately I want this run on the web. Next, I looked at [uploading apps with google app engine](https://developers.google.com/appengine/docs/python/gettingstartedpython27/uploading).

I added project to Google App Engine Launcher, clicked the all-too-subtle deploy text.

![sc2replay screenshot](http://sc2jsonhunt.appspot.com/images/replays/deploy.png)

Great success! This photo hunt app was now visible at [sc2jsonhunt.appspot.com](http://sc2jsonhunt.appspot.com/).

I renamed the folder from “gplus-photohunt-server-python” to “sc2jsonhunt”

$ dev_appserver.py sc2jsonhunt

The instructions for getting started are available at:
https://developers.google.com/+/photohunt/python

#### Adding sc2reader to sc2jsonhunt 

I copy and pasted the entire sc2reader folder into my sc2jsonhunt folder and attempted to run the app again. 

$ dev_appserver.py sc2jsonhunt

I need to connect the sc2reader with the photohunt code base. Where to begin? First, I opened "model.py" in Sublime and noticed that it some code about produce json namely JsonifiableEncoder. This was encouraging! Hopefully, I could leverage some of this code to create json from the output of sc2reader. I read through the models.py file and learned that it contained several classes including Photo, User, Theme and Message. I could probably add a class that dealt with sc2reader here too. 

But where is the main file? What kicks off this code base? There were 3 folders: apiclient, httplib2, oauth2client. I knew the last one must deal with authentication and the second one probably deals with http requests. Thus, the first one seems likely to create an API to serve up starcraft json.

At the top of the models.py file, I could see that it was importing code from these 3 folder. What if I attempted to import the sc2reader code in a similar fashion? With my limited Python, I started to code and added the following at the end of the models.py file. 

class Replay(db.Model, Jsonifiable):
  """Represents the sc2 json feed."""
  default_replay = 'swarms.SC2Replay'

$ dev_appserver.py sc2jsonhunt

I imagine this is how most developers work and experiment. Baby steps. I only want to change a few lines and see what happens. This didn't do anything but it also didn't break anything.   

I looked at the top of models.py again and studied:

from apiclient.discovery import build

I took a shot in the dark and added:

from sc2reader.scripts.sc2replayer import main

$ dev_appserver.py sc2jsonhunt

Having another developer in the office who actually knew Python well would have been quite helpful but unfortunately I didn't have that luxury. 

Finally, my first big bug.  While the app did appear in the browser, there were a bunch of errors in the terminal and learned about [how python execute from this stackoverflow thread](http://stackoverflow.com/questions/6523791/why-is-python-running-my-module-when-i-import-it-and-how-do-i-stop-it).

Within the sc2reader directory, there is another sub sc2reader folder. You want that sub folder with its __init__.py file. 

I want to import sc2reader to use in my project.

In model.py, I added sc2reader as the last import like so:

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

import sc2reader

$ dev_appserver.py sc2jsonhunt

Presto. It seems to be "working" now. I have no idea why the owner of this project wouldn't think to include that file. I can only guess that it must be good practice in python land not to... I should use my naviety to ask them. 

It's working yet I still don't have any sc2 data to play with. I thought it might it be a good idea to look at the client side and investigate the angular services. Starting with services.js, I built on top of the ReplayHuntApi copying getPhoto: 

 getReplay: function(replayId) {
          return $http.get(Conf.apiBase + 'replay', {params:
              {'replayId': replayId}});
        }

I updated controllers.js adding:


I added some blocks in the index.html to help motivate me. 

![hacking the index to motivate me](http://sc2jsonhunt.appspot.com/images/replays/hackPhotoHunt.png)

I updated handles.py and model.py adding a ReplaysHandler and a Replay model. At this point, I want to keep things super simple and only return a default string; don't even worry about the actual file yet.

class Replay(db.Model, Jsonifiable):
  """Represents the sc2 json feed."""
  default_theme = 'swarms.SC2Replay'

#### Testing the API in the browser

When you compile the app in the terminal, you'll see 3 urls created. 

INFO     2014-05-08 13:48:53,426 api_server.py:171] Starting API server at: http://localhost:51669
INFO     2014-05-08 13:48:53,432 dispatcher.py:182] Starting module "default" running at: http://localhost:8080
INFO     2014-05-08 13:48:53,439 admin_server.py:117] Starting admin server at: http://localhost:8000

In order to test the API, you can try the following in your address bar of your favourite browser: 

http://localhost:8080/api/themes - worked! I see data in the browser

http://localhost:8080/api/replay - #404 fail 

I searched through handlers.py and discovered the routes array near the bottom and added my replay route.

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

$ dev_appserver.py sc2jsonhunt

INFO     2014-05-08 14:15:08,493 module.py:627] default: "GET /api/replay HTTP/1.1" 200 16

1. I tried the API in the address bar: http://localhost:8080/api/replay

That's exciting! I see my swarms.SC2Replay string in the browser. 

2. I tried the app: http://localhost:8080/

Even more promising!!! In the console, I log out the response from controllers.js

Object {data: "swarms.SC2Replay", status: 200, headers: function, config: Object}
config: Object
data: "swarms.SC2Replay"
headers: function (c){a||(a=Mb(b));return c?a[E(c)]||null:a}
status: 200
__proto__: Object

At this point, I have created a new API that returns a simple string. Next challenge is a big one. I need it to talk to sc2reader; parse my swarms.sc2Replay file and return the events as json dump. No sweat. Again, I'll attempt to break up the works and first attempt to talk to the file and get perhaps a success event or some simple detail about it. 

I returned to the README.rst file in the sc2reader folder and focussed on the "Basic Usage" section. In particular, line 139 about loading game events sounds about right. By looking at code, I think I could adapt it and instead of returning a static string, I could write:

replayGameEvents = sc2reader.load_replay('MyReplay.SC2Replay', load_level=4)
[doc faq](http://sc2reader.readthedocs.org/en/latest/faq.html)

This should return all the game events. Before I test it, I have a feeling it won't work because how will it know that the file is loaded? Will Python know to wait before returning the results?! I know that I need to return json containing a list of game event objects which, comparing it to the PhotosHandler, I'm definitely not doing yet. Within my models.py, I have updated Replay: 

'
class Replay(db.Model, Jsonifiable):
  """Represents the sc2 json feed."""
  default_replay = 'swarms.SC2Replay'
  jsonkind = 'photohunt#replay'
  replays_events = sc2reader.load_replay('swarms.SC2Replay', load_level=4)
'

This doesn't work. I get errors and I think my original idea to import the top level sc2reader is wrong. I need to import the sub sc2reader instead. Also, the replay file itself is static and I could probably create a replays folder within the static directory but then how I find the path to it? Possibly by:

import sc2reader.sc2reader 

When I do this, I get a different error:

  File "/Users/bflowers/Projects/headwinds/sc2jsonhunt/sc2reader/sc2reader/__init__.py", line 10, in <module>
    from sc2reader import engine
  ImportError: cannot import name engine  

Within the sub sc2reader directory, I see the engine directory so why won't it get imported?! 

Further up there is another error which I missed a few times:

  File "/Users/bflowers/Projects/headwinds/sc2jsonhunt/sc2reader/resources.py", line 11, in <module>
    import mpyq
ImportError: No module named mpyq

So there is no mpyq folder in this project?! I googled it and found its github

$ git clone https://github.com/eagleflo/mpyq.git

Then copied that mpyq folder into sc2reader. 

Life Interruption:

"Brandon you know that diaper creme container you were supposed to put up on the shelf?"
"yeah"
"While I changing elodie, Mabel decided to smear it all over her bed, hair and glasses"
"Oh, I'll help"
"No, you stay I dont want to see you right now"


#### further reading

[Playing with REALTIME data, Python and D3](http://www.brettdangerfield.com/post/realtime_data_tag_cloud/)
[Analyzing a NHL Playoff Game with Twitter](http://www.danielforsyth.me/analyzing-a-nhl-playoff-game-with-twitter/)
[Fast interactive prototyping with Sketch and d3.js](http://snips.net/blog/posts/2014/05-04-fast-interactive_prototyping_with_d3_js_II.html)
[top 10 mistakes that python programmers make](http://www.toptal.com/python/top-10-mistakes-that-python-programmers-make)
[The Hitchhiker’s Guide to Python!](http://docs.python-guide.org/en/latest/)










