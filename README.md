# sc2jsonhunt

## challenge

I wanted to be able to take a Starcraft 2 replay file and produce a json feed of all the game events which I can use in my javascript experiments. 

## result

Instead of going with the desired json, I had to go with formatted comma separated data strings which I converted back to javascript objects which was fine for what I was trying to do. It may also work with your project. This repo includes that conversion work. 

## status

I'm no longer actively working on this particular code base because it accomplished my primary goal of getting SC2Replay data into my javascript project even though I didn't up getting the json feed to work as planned. If I make any further progress on the json feed, I'll definitely release it back here but for now I've decided to pursue the project privately and concentrate on the subjective design end of things. You can still follow the progress on the site: [http://starcraftmetamatch.appspot.com/](http://starcraftmetamatch.appspot.com/)    

last update: Sept 19/2014

## start

If you decide to clone this repo, you will need to have install Google App Engine installed and run: 

$ dev_appserver.py sc2jsonhunt 

-bash: dev_appserver.py: command not found

If this fails, it's dependant on symlinks created by the Google App Engine launcher and it may have recently updated and launching GAE should solve it.

## log

[first strike april 2014](https://github.com/headwinds/sc2jsonhunt/wiki/first-strike---april-2014)           
[design and purpose aug 2014](https://github.com/headwinds/sc2jsonhunt/wiki/design-and-purpose---aug-2014)     
[gameplay](https://github.com/headwinds/sc2jsonhunt/wiki/gameplay---sept-2014)      


