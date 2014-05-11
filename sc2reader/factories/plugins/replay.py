# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function, unicode_literals, division

import json
from collections import defaultdict

from sc2reader import log_utils
from sc2reader.utils import Length, JSONEncoder
from sc2reader.factories.plugins.utils import PlayerSelection, GameState, plugin


@plugin
def toJSON(replay, **user_options):
    options = dict(cls=JSONEncoder)
    options.update(user_options)
    return json.dumps(replay, **options)


@plugin
def APMTracker(replay):
    """
    Builds ``player.aps`` and ``player.apm`` dictionaries where an action is
    any Selection, Hotkey, or Ability event.

    Also provides ``player.avg_apm`` which is defined as the sum of all the
    above actions divided by the number of seconds played by the player (not
    necessarily the whole game) multiplied by 60.
    """
    for player in replay.players:
        player.aps = defaultdict(int)
        player.apm = defaultdict(int)
        player.seconds_played = replay.length.seconds

        for event in player.events:
            if event.name == 'SelectionEvent' or 'AbilityEvent' in event.name or 'Hotkey' in event.name:
                player.aps[event.second] += 1
                player.apm[int(event.second/60)] += 1

            elif event.name == 'PlayerLeaveEvent':
                player.seconds_played = event.second

        if len(player.apm) > 0:
            player.avg_apm = sum(player.aps.values())/float(player.seconds_played)*60
        else:
            player.avg_apm = 0

    return replay


@plugin
def SelectionTracker(replay):
    debug = replay.opt.debug
    logger = log_utils.get_logger(SelectionTracker)

    for person in replay.entities:
        # TODO: A more robust person interface might be nice
        person.selection_errors = 0
        player_selections = GameState(PlayerSelection())
        for event in person.events:
            error = False
            if event.name == 'SelectionEvent':
                selections = player_selections[event.frame]
                control_group = selections[event.control_group].copy()
                error = not control_group.deselect(event.mask_type, event.mask_data)
                control_group.select(event.new_units)
                selections[event.control_group] = control_group
                if debug:
                    logger.info("[{0}] {1} selected {2} units: {3}".format(Length(seconds=event.second), person.name, len(selections[0x0A].objects), selections[0x0A]))

            elif event.name == 'SetToHotkeyEvent':
                selections = player_selections[event.frame]
                selections[event.control_group] = selections[0x0A].copy()
                if debug:
                    logger.info("[{0}] {1} set hotkey {2} to current selection".format(Length(seconds=event.second), person.name, event.hotkey))

            elif event.name == 'AddToHotkeyEvent':
                selections = player_selections[event.frame]
                control_group = selections[event.control_group].copy()
                error = not control_group.deselect(event.mask_type, event.mask_data)
                control_group.select(selections[0x0A].objects)
                selections[event.control_group] = control_group
                if debug:
                    logger.info("[{0}] {1} added current selection to hotkey {2}".format(Length(seconds=event.second), person.name, event.hotkey))

            elif event.name == 'GetFromHotkeyEvent':
                selections = player_selections[event.frame]
                control_group = selections[event.control_group].copy()
                error = not control_group.deselect(event.mask_type, event.mask_data)
                selections[0xA] = control_group
                if debug:
                    logger.info("[{0}] {1} retrieved hotkey {2}, {3} units: {4}".format(Length(seconds=event.second), person.name, event.control_group, len(selections[0x0A].objects), selections[0x0A]))

            else:
                continue

            # TODO: The event level interface here should be improved
            #       Possibly use 'added' and 'removed' unit lists as well
            event.selected = selections[0x0A].objects
            if error:
                person.selection_errors += 1
                if debug:
                    logger.warn("Error detected in deselection mode {0}.".format(event.mask_type))

        person.selection = player_selections
        # Not a real lock, so don't change it!
        person.selection.locked = True

    return replay
