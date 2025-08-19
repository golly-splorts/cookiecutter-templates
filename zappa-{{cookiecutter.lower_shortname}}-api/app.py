import os
import pytz
import logging
from datetime import datetime, timedelta
from flask import Flask, jsonify
import gollyx_nongo
from gollyx_nongo.game_getter import IIGameGetter
from gollyx_nongo.team_getter import TeamsGetter
from gollyx_nongo.postseason_getter import (
    IIPostseasonPrecedingDayGetter,
    IIPostseasonDayGetter,
    IIPostseasonLengthGetter,
    IIPostseasonGetter,
)
from gollyx_nongo.seed_getter import (
    IISeedGetter,
)
from gollyx_nongo.season_getter import (
    IISeasonDayGetter,
    IISeasonPrecedingDayGetter,
    IISeasonGetter,
)
from gollyx_nongo.records_getter import (
    IIRecordsGetter,
)
from gollyx_nongo.champion_getter import (
    IIChampionGetter,
)


# -------------------------------------------
# CloudWatch + logging is all messed up
# https://stackoverflow.com/a/45624044/463213
#
# Remove preconfigured logger
root = logging.getLogger()
if root.handlers:
    for handler in root.handlers:
        root.removeHandler(handler)
# Add our own logger
logging.basicConfig(format='%(asctime)s %(message)s',level=logging.INFO)
# -------------------------------------------


__version__ = "{{cookiecutter.zappa_api_version}}"
HERE = os.path.abspath(os.path.dirname(__file__))
STAGE = os.environ["GOLLYX_STAGE"]
datadir = os.path.join(HERE, f"{STAGE}-data")


def setup_routes(app):
    def scrub_scores_jsonify_games(games):
        for game in games:
            for i in range(2):
                key = f"team{i+1}Score"
                if key in game:
                    del game[key]
            del game["generations"]
        return jsonify(games)

    @app.route("/ping")
    def ping():
        return jsonify(ping="pong")

    @app.route("/version")
    def version():
        return jsonify(version=__version__)

    @app.route("/nongo_version")
    def nongo_version():
        return jsonify(version=gollyx_nongo.__version__)

    @app.route("/mode")
    def site_mode():
        t = Timekeeper()
        return jsonify(t.get_site_mode())

    @app.route("/today")
    def today():
        t = Timekeeper()
        resp = t.get_site_mode()
        mode = resp["mode"]
        if mode > 0:
            season0 = t.get_current_season()
            day0 = t.get_current_day()
            return jsonify([season0, day0])
        else:
            season0 = t.get_current_season()
            return jsonify([season0, -1])

    @app.route("/currentGames")
    def current_games():
        t = Timekeeper()
        resp = t.get_site_mode()
        mode = resp["mode"]

        season0 = t.get_current_season()
        day0 = t.get_current_day()

        if mode < 0:
            # wat
            raise FlaskError()

        elif mode < 10:
            # pre-season
            return jsonify([])

        elif mode < 20:
            # Regular season
            # Get games for today, remove score and generations info
            sdg = IISeasonDayGetter(datadir, season0, day0)
            games = sdg.get_season_day_game_data_slim()

            # Scrub games of scores and return
            return scrub_scores_jsonify_games(games)

        elif mode < 30:
            # Postseason has not started yet, return first scheduled game of the series
            if mode==21:
                series = 'LDS'
            elif mode==22:
                series = 'LCS'
            elif mode==23:
                series = 'HCS'
            else:
                raise APIError()
            getter = IIPostseasonDayGetter(datadir, season0, series, 1)
            games = getter.get_postseason_day_game_data_slim()
            games.sort(key=lambda x: x["description"])

            # Scrub games of scores and return
            return scrub_scores_jsonify_games(games)

        elif mode < 40:
            elapsed = resp["elapsed"]
            # Postseason is happening
            if mode==31:
                series = 'LDS'
            elif mode==32:
                series = 'LCS'
            elif mode==33:
                series = 'HCS'
            else:
                raise APIError()
            series_day = (elapsed//3600) + 1
            getter = IIPostseasonDayGetter(datadir, season0, series, series_day)
            games = getter.get_postseason_day_game_data_slim()
            games.sort(key=lambda x: x["description"])

            # Scrub games of scores and return
            return scrub_scores_jsonify_games(games)

        else:
            return jsonify([])

    @app.route("/games/<int:season0>/<int:day0>")
    def games(season0, day0):
        """
        For a given season and day, return info about the completed games on that day.
        If user requests the current day or any days after, no results are returned.
        season and day are ZERO-INDEXED.
        """
        if season0 < 0 or day0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        resp = t.get_site_mode()
        mode = resp["mode"]
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Past season, so return data
            dg = IISeasonDayGetter(datadir, season0, day0)
            return jsonify(dg.get_season_day_game_data_slim())

        elif season0 > current_season0:
            raise FutureSeasonError()

        elif season0 == current_season0:
            # Season is underway
            current_day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]
            if day0 < current_day0 or mode >= 40:
                # This day has passed, so return data
                dg = IISeasonDayGetter(datadir, season0, day0)
                return jsonify(dg.get_season_day_game_data_slim())
            elif day0 == current_day0 and mode > 10 and mode < 30:
                # We are waiting for the next series,
                # ok to return today
                dg = IISeasonDayGetter(datadir, season0, day0)
                return jsonify(dg.get_season_day_game_data_slim())

        # If we reach this point, don't return any data
        return jsonify([])

    @app.route("/game/<gameid>")
    def game(gameid, event=None, context=None):
        gg = IIGameGetter(datadir, gameid)
        game = gg.get_game_data()

        # Check when the game happened
        t = Timekeeper()
        resp = t.get_site_mode()
        mode = resp["mode"]
        season0 = t.get_current_season()
        day0 = t.get_current_day()

        if game["season"] < season0:
            # Game was prior to today, return entire game
            return jsonify(game)

        elif game["season"] == season0:

            # Game was this season, compare day
            if game["day"] < day0:
                # Game was prior to today
                return jsonify(game)
            elif game["day"] == day0:
                if mode > 10 and mode < 30:
                    # Return the full game, today day has already passed
                    return jsonify(game)
                else:
                    # Scrub scores and generation info
                    for i in range(2):
                        key = f"team{i+1}Score"
                        if key in game:
                            del game[key]
                    del game["generations"]
                    return jsonify(game)

        # If we reach this point, no game data to return
        raise InvalidGameError()

    @app.route("/seasons")
    def seasons():
        """
        Return a short flat list of all seasons (0-indexed) that have been started (incl. current season).
        """
        t = Timekeeper()
        season0 = t.get_current_season()
        seasons_list = list(range(0, season0 + 1))
        return jsonify(seasons_list)

    @app.route("/season")
    def season():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_season(season0)

    @app.route("/season/<int:season0>")
    def a_season(season0):
        """
        For the given season, return a list of days (list of lists of games).
        - inner list: one element per game that day
        If the season specified is underway, this will filter out current day and all days following.
        Season is ZERO-INDEXED.
        """
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Past season, so return full season
            sg = IISeasonGetter(datadir, season0)
            return jsonify(sg.get_season_game_data_slim())

        elif season0 > current_season0:
            raise FutureSeasonError()

        elif season0 == current_season0:
            # Season is underway
            day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]

            if mode < 10:
                # season has not started
                return jsonify([])
            elif mode < 20:
                # Regular season, use IISeasonPrecedingDayGetter
                spd = IISeasonPrecedingDayGetter(datadir, season0, day0)
                return jsonify(spd.get_season_precedingday_game_data_slim())
            else:
                # The season is over, so return full season
                sg = IISeasonGetter(datadir, season0)
                return jsonify(sg.get_season_game_data_slim())

        raise FlaskError()

    @app.route("/postseason")
    def postseason():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_postseason(season0)

    @app.route("/postseason/<int:season0>")
    def a_postseason(season0):
        """
        Given a season, return a dictionary containing:
        - one key per series (LDS, LCS, HCS)
        - each value is a list of lists containing:
            - outer list: one element per postseason day
            - inner list: one element per game that day
        Season is ZERO-INDEXED.
        """
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Past season, so return full postseason
            pg = IIPostseasonGetter(datadir, season0)
            return jsonify(pg.get_postseason_data_slim())

        elif season0 > current_season0:
            raise FutureSeasonError()

        elif season0 == current_season0:
            # Season is underway
            day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]
            if mode < 20:
                # Regular season is about to start or still in progress
                return jsonify({})
            elif mode < 30:
                # Waiting for next postseason series
                # Current day returns the day of the last game played
                # The postseason being returned
                if mode == 21:
                    series = "LDS"
                elif mode == 22:
                    series = "LCS"
                elif mode == 23:
                    series = "HCS"
                else:
                    raise FlaskError()
                ppdg = IIPostseasonPrecedingDayGetter(datadir, season0, series, 1)
                result = ppdg.get_postseason_precedingdays_game_data_slim()
                for s in result.keys():
                    for i, _ in enumerate(result[s]):
                        result[s][i].sort(key=lambda x: x["description"])
                return jsonify(result)
            elif mode < 40:
                # There is currently an ongoing postseason game
                # Use elapsed seconds to determine which series day we are in
                if mode == 31:
                    series = "LDS"
                elif mode == 32:
                    series = "LCS"
                elif mode == 33:
                    series = "HCS"
                else:
                    raise FlaskError()
                series_day = resp["elapsed"] // 3600
                ppdg = IIPostseasonPrecedingDayGetter(
                    datadir, season0, series, series_day + 1
                )
                result = ppdg.get_postseason_precedingdays_game_data_slim()
                for s in result.keys():
                    for i, _ in enumerate(result[s]):
                        result[s][i].sort(key=lambda x: x["description"])
                return jsonify(result)
            else:
                pdg = IIPostseasonGetter(datadir, season0)
                result = pdg.get_postseason_data_slim()
                for s in result.keys():
                    for i, _ in enumerate(result[s]):
                        result[s][i].sort(key=lambda x: x["description"])
                return jsonify(result)

        raise FlaskError()

    @app.route("/seeds")
    def seeds():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_seeds(season0)

    @app.route("/seeds/<int:season0>")
    def a_seeds(season0):
        """
        Given a zero-indexed season, return a dictionary containing:
        - keys: each league
        - values: list of the top 4 seeeds for corresponding league, in order
        - (or empty list, if season has not finished yet)
        """
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Past season, so return seed table
            sg = IISeedGetter(datadir, season0)
            return jsonify(sg.get_seed_table())

        elif season0 > current_season0:
            raise FutureSeasonError()

        elif season0 == current_season0:
            # Season is underway
            day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]
            if mode < 20:
                # Regular season is still in progress
                return jsonify({})
            else:
                # Season is finished, seed table is decided
                sg = IISeedGetter(datadir, season0)
                return jsonify(sg.get_seed_table())

        raise FlaskError()

    @app.route("/champion")
    def champion():
        """Returns the II Cup champion for the current season that just ended, otherwise return nothing"""
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_champion(season0)

    @app.route("/champion/<int:season0>")
    def a_champion(season0):
        """Returns the II Cup champion for the specified season"""
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Past season, so return champions from past season
            cg = IIChampionGetter(datadir, season0)
            return jsonify(cg.get_champion_data())
        elif season0 == current_season0:
            resp = t.get_site_mode()
            mode = resp["mode"]
            if mode < 40:
                return jsonify({})
            else:
                cg = IIChampionGetter(datadir, season0)
                return jsonify(cg.get_champion_data())
        elif season0 > current_season0:
            raise FutureSeasonError()

        raise FlaskError()

    @app.route("/teams")
    def teams():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_teams(season0)

    @app.route("/teams/<int:season0>")
    def a_teams(season0):
        """
        Return all team info for the specified season.
        Season is ZERO-INDEXED.
        """
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 <= current_season0:
            # Okie dokie here ya go
            tg = TeamsGetter(datadir, season0)
            td = tg.get_teams_data()
            td.sort(key=lambda x: x["teamAbbr"])
            return jsonify(td)
        else:
            raise FutureSeasonError()

    @app.route("/records")
    def records():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_records(season0)

    @app.route("/records/<int:season0>")
    def a_records(season0):
        """
        Return WL record info for all teams in the given season.

        If current season is specified, and current season is in progress,
        the records up to (not including) the current day will be returned.
        After season ends, this returns final WL record for the season.

        If IIRecordsGetter receives a day > 48, it returns the records
        as of the end of the season.
        """
        if season0 < 0:
            raise InvalidSeasonError()

        t = Timekeeper()
        current_season0 = t.get_current_season()

        if season0 < current_season0:
            # Season is past, so return records at end of season
            rg = IIRecordsGetter(datadir, season0)
            wlrecords = rg.get_records_data(use_abbr=False)
            return jsonify(wlrecords)

        elif season0 > current_season0:
            raise FutureSeasonError()

        elif season0 == current_season0:
            current_day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]
            if mode > 10 and mode < 30:
                # for 20s, return records as of tomorrow
                # (for mode 21)
                rg = IIRecordsGetter(datadir, season0, current_day0 + 1)
                wlrecords = rg.get_records_data(use_abbr=False)
                return jsonify(wlrecords)
            else:
                rg = IIRecordsGetter(datadir, season0, current_day0)
                wlrecords = rg.get_records_data(use_abbr=False)
                return jsonify(wlrecords)

        raise FlaskError()

    @app.route("/standings")
    def standings():
        t = Timekeeper()
        season0 = t.get_current_season()
        return a_standings(season0)

    @app.route("/standings/<int:season0>")
    def a_standings(season0):

        """
        Return standings data.

        Example:

        {
            "leagues": [...],
            "divisions": [...],
            "records": {
                "league1": {
                    "div1": [
                        { "teamName": ..., "teamWinLoss": [W, L], "teamColor": ...},
                        { "teamName": ..., "teamWinLoss": [W, L], "teamColor": ...},
                    ],
                    "div2": [
                        ...
                    ],
                },
                "league2": {
                    ...
                }
            }
        }
        """
        # No matter what the mode, we will always return
        # a standings data structure, so set to work
        # assembling it
        t = Timekeeper()
        current_season0 = t.get_current_season()
        current_day0 = t.get_current_day()

        # Assemble league/div structure
        tg = TeamsGetter(datadir, season0)
        teams = tg.get_teams_data()
        leagues = {t["league"] for t in teams}
        leagues = sorted(list(leagues))
        divisions = {t["division"] for t in teams}
        divisions = sorted(list(divisions))

        # Assemble rankings data structure
        rankings = {}
        for league in leagues:
            divstruct = {}
            for division in divisions:
                divstruct[division] = []
            rankings[league] = divstruct

        wlrecords = None
        if season0 < current_season0:
            # Season is past
            rg = IIRecordsGetter(datadir, season0)
            wlrecords = rg.get_records_data(use_abbr=True)

        elif season0 == current_season0:
            current_day0 = t.get_current_day()
            resp = t.get_site_mode()
            mode = resp["mode"]
            if mode > 10 and mode < 30:
                rg = IIRecordsGetter(datadir, season0, current_day0 + 1)
                wlrecords = rg.get_records_data(use_abbr=True)
            else:
                rg = IIRecordsGetter(datadir, season0, current_day0)
                wlrecords = rg.get_records_data(use_abbr=True)

        else:
            raise FutureSeasonError()

        # Now populate the final data structure with the WL records
        for league in leagues:
            for division in divisions:
                for team in teams:
                    if team["league"] == league and team["division"] == division:
                        divlist = rankings[league][division]
                        team["teamWinLoss"] = wlrecords[team["teamAbbr"]]
                        divlist.append(team)
                rankings[league][division].sort(
                    key=lambda x: x["teamWinLoss"][0], reverse=True
                )

        # Final structure to return
        structure = {}
        structure["leagues"] = leagues
        structure["divisions"] = divisions
        structure["rankings"] = rankings
        return jsonify(structure)

    @app.after_request
    def after_request(response):
        """Enable cross-origin requests"""
        header = response.headers
        header["Access-Control-Allow-Origin"] = "*"
        header["Access-Control-Allow-Headers"] = "Content-Type"
        return response


class Timekeeper(object):
    """
    The Timekeeper is an object that helps the GollyX API
    keep track of real time and map it to different GollyX
    seasons and different parts of the season.

    Nearly every API endpoint requires current season/day
    or a site mode, so this will end up being created
    in the Flask app constructor.
    """

    DAYS_PER_SEASON = 49
    SEASONS = 24

    def __init__(self):
        self.time_zone = pytz.timezone("US/Pacific")
        # Autoretire
        if not self.is_retired():
            self.prepare_current_season_marker_pool()

    def get_current_season(self):
        """Get the current season"""
        # Autoretire
        if self.is_retired():
            return self.SEASONS-1

        season0, _ = self.get_current_season_starttime()
        return season0

    def get_current_day(self):
        # Autoretire
        if self.is_retired():
            return 99

        resp = self.get_site_mode()
        mode = resp["mode"]
        season0, _ = self.get_current_season_starttime()
        dps = self.DAYS_PER_SEASON
        if mode < 0:
            # wat
            raise FlaskError()
        elif mode < 10:
            return -1
        elif mode < 20:
            # mode 10-19, season underway
            elapsed_seconds = resp["elapsed"]
            elapsed_hours = elapsed_seconds // 3600
            return elapsed_hours
        elif mode < 30:
            # Mode 20-29: waiting for postseason
            if mode == 21:
                # Waiting for LDS to begin
                return dps - 1
            elif mode == 22:
                # Waiting for LCS to begin
                lds_length = self.get_postseason_series_length(season0, "LDS")
                return dps + lds_length - 1
            elif mode == 23:
                # Waiting for HCS to begin
                lds_length = self.get_postseason_series_length(season0, "LDS")
                lcs_length = self.get_postseason_series_length(season0, "LCS")
                return dps + lds_length + lcs_length - 1
            else:
                return -1
        elif mode < 40:
            # Mode 30-39: postseason underway
            if mode == 31:
                # LDS
                elapsed_seconds = resp["elapsed"]
                elapsed_hours = elapsed_seconds // 3600
                return dps + elapsed_hours
            elif mode == 32:
                # LCS
                lds_length = self.get_postseason_series_length(season0, "LDS")
                elapsed_seconds = resp["elapsed"]
                elapsed_hours = elapsed_seconds // 3600
                return dps + lds_length + elapsed_hours
            elif mode == 33:
                # HCS
                lds_length = self.get_postseason_series_length(season0, "LDS")
                lcs_length = self.get_postseason_series_length(season0, "LCS")
                elapsed_seconds = resp["elapsed"]
                elapsed_hours = elapsed_seconds // 3600
                return dps + lds_length + lcs_length + elapsed_hours
            else:
                return -1
        else:
            # Mode 40: season over
            lds_length = self.get_postseason_series_length(season0, "LDS")
            lcs_length = self.get_postseason_series_length(season0, "LCS")
            hcs_length = self.get_postseason_series_length(season0, "HCS")
            return dps + lds_length + lcs_length + hcs_length

    def get_site_mode(self):
        """
        00-09 - pre-season
            0 only
        10-19 - season underway
            10 only
        20-29 - season over, pre-postseason
            21: waiting for LDS to start
            22: waiting for LCS to start
            23: waiting for HCS to start
        30-39 - postseason underway
            31: LDS underway
            32: LCS underway
            33: HCS underway
        40+   - postseason over
            40 only
        -1    - w h a t
        """
        # Autoretire
        if self.is_retired():
            return {"mode": 40, "season": self.SEASONS-1}

        # General idea: find the difference between the current time and each marker in sequence.
        # If the difference is negative, the marker hasn't occurred yet, and you have your site mode.
        self.prepare_current_season_marker_pool()

        # NOTE: Each diff below is a value in SECONDS

        # season start
        diffss = self.get_marker_diff_season_start()
        if diffss < 0:
            # Pre-season baby
            return {
                "mode": 0,
                "season": self.get_current_season(),
                "start": -1 * diffss,
            }

        # season end
        diffse = self.get_marker_diff_season_end()
        if diffse < 0:
            # Season is still going on
            return {"mode": 10, "season": self.get_current_season(), "elapsed": diffss}

        # div series start
        diffldss = self.get_marker_diff_lds_start()
        if diffldss < 0:
            # Season is over
            # LDS is about to begin
            return {
                "mode": 21,
                "season": self.get_current_season(),
                "start": -1 * diffldss,
            }

        # div series end
        diffldse = self.get_marker_diff_lds_end()
        if diffldse < 0:
            # LDS has begun, and has not ended yet
            return {
                "mode": 31,
                "season": self.get_current_season(),
                "elapsed": diffldss,
            }

        # champ series start
        difflcss = self.get_marker_diff_lcs_start()
        if difflcss < 0:
            # LCS is about to begin
            return {
                "mode": 22,
                "season": self.get_current_season(),
                "start": -1 * difflcss,
            }

        # champ series end
        difflcse = self.get_marker_diff_lcs_end()
        if difflcse < 0:
            # LCS is underway
            return {
                "mode": 32,
                "season": self.get_current_season(),
                "elapsed": difflcss,
            }

        # hcs series start
        diffhcss = self.get_marker_diff_hcs_start()
        if diffhcss < 0:
            # About to begin
            return {
                "mode": 23,
                "season": self.get_current_season(),
                "start": -1 * diffhcss,
            }

        # hcs series end
        diffhcse = self.get_marker_diff_hcs_end()
        if diffhcse < 0:
            # In Progress
            return {
                "mode": 33,
                "season": self.get_current_season(),
                "elapsed": diffhcss,
            }
        else:
            # The end has come to pass
            return {
                "mode": 40,
                "season": self.get_current_season(),
                "elapsed": diffhcse,
            }

    def prepare_current_season_marker_pool(self):
        """
        Prepare the pool of markers for the current season.

        The marker pool contains marker points in the season
        where the site mode changes.
        """
        season0, season_start = self.get_current_season_starttime()
        self.season_start = season_start

        dps = self.DAYS_PER_SEASON
        one_day = 24

        # Season is dps games, 1 hr between each game
        self.season_end = self.season_start + timedelta(hours=dps)

        # Postseason starts 1 hour after the season ends (DPS + 1 hours after season start)
        self.postseason_start = self.season_end + timedelta(hours=1)

        # -----
        # LDS

        self.postseason_lds_start = self.postseason_start

        # LDS ends 1 hour after last game
        lds_hours = self.get_postseason_series_length(season0, "LDS")
        self.postseason_lds_end = self.postseason_lds_start + timedelta(hours=lds_hours)

        # ----
        # LCS 

        # starts 72 hours after season start (DPS - 1 + 24 hours)
        self.postseason_lcs_start = self.season_start + timedelta(hours=dps-1+one_day)

        # ends 1 hour after last LCS game
        lcs_hours = self.get_postseason_series_length(season0, "LCS")
        self.postseason_lcs_end = self.postseason_lcs_start + timedelta(hours=lcs_hours)

        # ----
        # HCS

        # starts 24 hours after LCS starts
        self.postseason_hcs_start = self.postseason_lcs_start + timedelta(hours=24)

        # ends 1 hour after last game
        hcs_hours = self.get_postseason_series_length(season0, "HCS")
        self.postseason_hcs_end = self.postseason_hcs_start + timedelta(hours=hcs_hours)

    def get_marker_diff_season_start(self):
        dtnow = datetime.now(self.time_zone)
        diffse = (dtnow - self.season_start).total_seconds()
        return int(diffse)

    def get_marker_diff_season_end(self):
        dtnow = datetime.now(self.time_zone)
        diffse = (dtnow - self.season_end).total_seconds()
        return int(diffse)

    def get_marker_diff_lds_start(self):
        dtnow = datetime.now(self.time_zone)
        diffldss = (dtnow - self.postseason_lds_start).total_seconds()
        return int(diffldss)

    def get_marker_diff_lds_end(self):
        dtnow = datetime.now(self.time_zone)
        diffldse = (dtnow - self.postseason_lds_end).total_seconds()
        return int(diffldse)

    def get_marker_diff_lcs_start(self):
        dtnow = datetime.now(self.time_zone)
        difflcss = (dtnow - self.postseason_lcs_start).total_seconds()
        return int(difflcss)

    def get_marker_diff_lcs_end(self):
        dtnow = datetime.now(self.time_zone)
        difflcse = (dtnow - self.postseason_lcs_end).total_seconds()
        return int(difflcse)

    def get_marker_diff_hcs_start(self):
        dtnow = datetime.now(self.time_zone)
        diffhcss = (dtnow - self.postseason_hcs_start).total_seconds()
        return int(diffhcss)

    def get_marker_diff_hcs_end(self):
        dtnow = datetime.now(self.time_zone)
        diffhcse = (dtnow - self.postseason_hcs_end).total_seconds()
        return int(diffhcse)

    def is_retired(self):
        season0, _ = self.get_current_season_starttime()
        if season0 > self.SEASONS-1:
            return True
        else:
            return False

    def get_current_season_starttime(self):
        """
        Return the current season and the start time of the currrent season.
        (season0, season0_start)
        """
        gold_start = self.get_gold_starttime()
        today = datetime.now()
        delta = today - gold_start
        daysfromstart = delta.days
        weeksfromstart = daysfromstart // 7
        leftover = daysfromstart % 7
        if leftover > 5:
            # Roll over to next season 6 days after start of season
            # Set mode to 0
            season0 = weeksfromstart + 1
        else:
            season0 = weeksfromstart
        if season0 < 0:
            season0 = 0
        season0_start = gold_start + timedelta(weeks=season0)
        # Localize after timedelta, since the above operation will not affect the datetime time zone
        season0_start = self.time_zone.localize(season0_start)
        return (season0, season0_start)

    def get_gold_starttime(self):
        """
        Return a datetime object set to the start time of Season 1
        """
        try:
            # User must specify both
            start_date = os.environ["GOLLYX_CLOUD_START_DATE"]
            start_hour = int(os.environ["GOLLYX_CLOUD_START_HOUR"])
        except KeyError:
            err = f"Error: The default start date/hour must be specified via the "
            err += "GOLLYX_CLOUD_START_DATE and GOLLYX_CLOUD_START_HOUR environment variables."
            raise Exception(err)

        start_dt = datetime.fromisoformat(start_date).replace(hour=start_hour)
        # Note: don't localize the datetime here, wait until we have done our time delta calculation

        return start_dt

    def get_postseason_series_length(self, season0, series):
        getter = IIPostseasonLengthGetter(datadir, season0, series)
        return getter.get_series_length()


class FlaskError(Exception):
    """
    An API Error class taken from the Flask documentation:
    https://flask.palletsprojects.com/en/1.1.x/patterns/apierrors/
    """

    status_code = 500
    message = "GollyX API Error"

    def __init__(self, message=None, status_code=None, payload=None):
        Exception.__init__(self)
        if message is not None:
            self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        return rv


class TimekeeperError(FlaskError):
    status_code = 500
    message = "Timekeeper Error"


class APIError(FlaskError):
    status_code = 500
    message = "Golly API Error"


class InvalidSeasonError(FlaskError):
    status_code = 400
    message = "Invalid Season Error"


class FutureSeasonError(FlaskError):
    status_code = 400
    message = "Future Season Error"


class FutureGameError(FlaskError):
    status_code = 400
    message = "Future Game Error"


class InvalidGameError(FlaskError):
    status_code = 400
    message = "Invalid Game ID Error"


class InvalidMapError(FlaskError):
    status_code = 400
    message = "Invalid Map Error"


def setup_errorhandling(app):
    """Attach various error handling decorators to the Flask app"""

    @app.errorhandler(FlaskError)
    def invalid(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response


app = Flask(__name__)
app.__version__ = __version__
setup_routes(app)
setup_errorhandling(app)


if __name__ == "__main__":
    app.run(debug=True)
