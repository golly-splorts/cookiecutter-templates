import os
import json


LAST_SEASON0 = 23

SERIES_GPD = {"LDS": 4, "LCS": 2, "HCS": 1}

ABBR_TO_NAME = {
    "LDS": "League Division Series",
    "LCS": "League Championship Series",
    "HCS": "Hellmouth {{cookiecutter.upper_shortname}} Cup",
}

CHOKE_ARTISTS = ['DET', 'BTX2']


for iseason in range(LAST_SEASON0 + 1):
    seasondir = "season%d" % (iseason)

    #####################
    # load team data

    teamsfile = os.path.join(seasondir, "teams.json")

    print("***************************")
    print(f"Now checking {teamsfile}")

    if not os.path.exists(teamsfile):
        raise Exception(f"Error: missing file: {teamsfile}")

    with open(teamsfile, "r") as f:
        teams = json.load(f)

    teams_team_names = sorted([j["teamName"] for j in teams])

    # -----------
    # team function defs

    def get_team_color(teamName):
        for team in teams:
            if team["teamName"] == teamName:
                return team["teamColor"]
        raise Exception(f"Error: could not find a color for team {teamName}")

    def get_team_league(teamName):
        for team in teams:
            if team["teamName"] == teamName:
                return team["league"]
        raise Exception(f"Error: could not find a league for team {teamName}")

    #####################
    # check games

    # -----------
    # game function defs

    def check_id(game):
        if "id" not in game:
            raise Exception(f"Error: missing game id from game {game}")

    def check_name_color_match(game):
        """For a given game ensure the team name matches the team color"""
        t1 = game["team1Name"]
        t1c = game["team1Color"]
        if t1c != get_team_color(t1):
            err = f"Error in game {game['id']} of season {game['season']} day {game['day']}:\n"
            err += f"Team 1 {t1} had specified team color {t1c}\n"
            err += f"Does not match get_team_color({t1}) = {get_team_color(t1)}"
            raise Exception(err)
        t2 = game["team2Name"]
        t2c = game["team2Color"]
        if t2c != get_team_color(t2):
            err = f"Error in game {game['id']} of season {game['season']} day {game['day']}:\n"
            err += f"Team 2 {t2} had specified team color {t2c}\n"
            err += f"Does not match get_team_color({t2}) = {get_team_color(t2)}"
            raise Exception(err)

    def check_score(game):
        t1s = game["team1Score"]
        t2s = game["team2Score"]
        if t1s == t2s:
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: game is tied! {t1s}-{t2s}"
            )
        if t1s < 0 or t2s < 0:
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: negative score ({t1s})-({t2s})"
            )
        if t1s < 10 and t2s < 10:
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: both teams had scores < 10"
            )

    def check_generations(game):
        gens = game["generations"]
        if gens < 990:
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: game is too short (< 500 generations)!"
            )

    def check_league(game):
        league = game["league"]
        t1 = game["team1Name"]
        t2 = game["team2Name"]
        t1lea = get_team_league(t1)
        t2lea = get_team_league(t2)
        if (t1lea != league) or (t2lea != league):
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: league information does not match: {t1}:{t1lea}, {t2}:{t2lea}"
            )

    def check_id(game):
        if "id" not in game.keys():
            print(game)
            raise Exception(
                f"Error in game of season {game['season']} day {game['day']}: no id found"
            )

    def check_pattern(game):
        if "patternName" not in game.keys():
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: game is missing required key patternName"
            )

    def check_map(game):
        if "map" not in game.keys():
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: game is missing required key patternName"
            )
        mapp = game["map"]
        # required keys that must be present
        req_keys = [
            "mapName",
            "initialConditions1",
            "initialConditions2",
            "rows",
            "columns",
            "cellSize",
            "patternName",
        ]
        # unused keys that should not be present
        unreq_keys = ["url", "patternId"]

        for rk in req_keys:
            if rk not in mapp:
                raise Exception(
                    f"Error in game {game['id']} of season {game['season']} day {game['day']}: game map is missing key \"{rk}\"!"
                )
        # for urk in unreq_keys:
        #    if urk in mapp:
        #        raise Exception("Error in game {game['id']} of season {game['season']} day {game['day']}: game map should not have key \"{urk}\"!")

    def check_wl(game):
        req_keys = ["team1WinLoss", "team2WinLoss"]
        for rk in req_keys:
            if rk not in game:
                raise Exception(
                    f"Error in game {game['id']} of season {game['season']} day {game['day']}: game map is missing key \"{rk}\"!"
                )

        wlsum1 = game["team1WinLoss"][0] + game["team1WinLoss"][1]
        wlsum2 = game["team2WinLoss"][0] + game["team2WinLoss"][1]
        if wlsum1 != (game["day"]):
            print(game)
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: win loss record for team 1 sums to {wlsum1}, should sum to {game['day']}"
            )
        if wlsum2 != (game["day"]):
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: win loss record for team 2 sums to {wlsum2}, should sum to {game['day']}"
            )

    def check_game_season(game, correct_season):
        if iseason != game["season"]:
            raise Exception(
                f"Error in game {game['id']} of season {game['season']} day {game['day']}: season should be {correct_season}"
            )

    def check_season_day(day):
        if len(day) != len(teams) // 2:
            raise Exception(
                f"Error: day {day[0]['day']} has length {len(day)} but should have length {len(teams)//2}"
            )

    def check_bracket_day(day, series, iday):
        series_gpd = SERIES_GPD
        if series not in series_gpd:
            raise Exception(
                f"Error: series name {series} not in {', '.join(series_gpd.keys())}"
            )
        if iday <= 2 and len(day) != series_gpd[series]:
            raise Exception(
                f"Error: bracket for series {series} has incorrect number of games ({len(day)}, should be {series_gpd[series]})"
            )

    def check_postseason_game_descr(game, series_name):
        if series_name not in game["description"]:
            err = f"Error: series name {series_name} not found in game description {game['description']}"
            raise Exception(err)

    # -----------
    # schedule

    schedfile = os.path.join(seasondir, "schedule.json")

    print("***************************")
    print(f"Now checking {schedfile}")

    if not os.path.exists(schedfile):
        raise Exception(f"Error: missing file: {schedfile}")

    with open(schedfile, "r") as f:
        sched = json.load(f)

    sched_team_names = set()
    sched_game_ids = set()
    for iday, day in enumerate(sched):
        check_season_day(day)
        games = day
        for igame, game in enumerate(games):
            t1 = game["team1Name"]
            t2 = game["team2Name"]

            check_id(game)
            check_name_color_match(game)
            check_league(game)
            check_pattern(game)
            check_game_season(game, iseason)

            sched_team_names.add(t1)
            sched_team_names.add(t2)

            if game["id"] in sched_game_ids:
                raise Exception(
                    f"Error: game id {game['id']} is a duplicate in the schedule!"
                )
            else:
                sched_game_ids.add(game["id"])

    # schedule.json and teams.json must have the same number of teams
    if len(sched_team_names) != len(teams):
        raise Exception(
            f"Error: number of teams found in schedule was {len(sched_team_names)}, number of teams is {len(teams)}"
        )

    # schedule.json and teams.json must have exactly the same team names
    diff1 = set(sched_team_names) - set(teams_team_names)
    diff2 = set(teams_team_names) - set(sched_team_names)
    if len(diff1) > 0 or len(diff2) > 0:
        err = "Error: mismatch in teams.json and schedule.json team names:\n"
        err += f"schedule.json team names: {', '.join(sched_team_names)}\n"
        err += f"teams.json team names: {', '.join(teams_team_names)}\n"
        raise Exception(err)

    for team in teams:
        if team["teamName"] not in sched_team_names:
            raise Exception(
                f"Error: team name {team['teamName']} not found in schedule.json"
            )

    # -----------
    # season

    seasonfile = os.path.join(seasondir, "season.json")

    print("***************************")
    print(f"Now checking {seasonfile}")

    if not os.path.exists(seasonfile):
        raise Exception(f"Error: missing file: {seasonfile}")

    with open(seasonfile, "r") as f:
        season = json.load(f)

    season_team_names = set()
    season_game_ids = set()
    for iday, day in enumerate(season):
        check_season_day(day)
        games = day
        for igame, game in enumerate(games):
            t1 = game["team1Name"]
            t2 = game["team2Name"]

            check_id(game)
            check_name_color_match(game)
            check_score(game)
            check_generations(game)
            check_league(game)
            check_id(game)
            check_map(game)
            check_wl(game)
            check_game_season(game, iseason)

            season_team_names.add(t1)
            season_team_names.add(t2)

            if game["id"] in season_game_ids:
                raise Exception(
                    f"Error: game id {game['id']} is a duplicate in the season!"
                )
            else:
                season_game_ids.add(game["id"])

    # season.json and teams.json must have the same number of teams
    if len(season_team_names) != len(teams):
        raise Exception(
            f"Error: number of teams found in season was {len(season_team_names)}, number of teams is {len(teams)}"
        )

    # season.json and teams.json must have exactly the same team names
    diff1 = set(season_team_names) - set(teams_team_names)
    diff2 = set(teams_team_names) - set(season_team_names)
    if len(diff1) > 0 or len(diff2) > 0:
        err = "Error: mismatch in teams.json and season.json team names:\n"
        err += f"season.json team names: {', '.join(season_team_names)}\n"
        err += f"teams.json team names: {', '.join(teams_team_names)}\n"
        raise Exception(err)

    for team in teams:
        if team["teamName"] not in season_team_names:
            raise Exception(
                f"Error: team name {team['teamName']} not found in season.json"
            )

    # season.json and schedule.json must have exactly the same game ids
    diff3 = season_game_ids - sched_game_ids
    diff4 = sched_game_ids - season_game_ids
    if len(diff3) > 0 or len(diff4) > 0:
        err = "Error: mismatch in game IDs between schedule and season:\n"
        if len(diff3) > 0:
            for id in sorted(list(diff3)):
                err += f" - {id}\n"
        if len(diff4) > 0:
            for id in sorted(list(diff4)):
                err += f" - {id}\n"
        raise Exception(err)

    # -----------
    # seed
    seedfile = os.path.join(seasondir, "seed.json")

    print("***************************")
    print(f"Now checking {seedfile}")

    if not os.path.exists(seedfile):
        raise Exception(f"Error: missing file: {seedfile}")

    with open(seedfile, "r") as f:
        seed = json.load(f)

    seed_team_names = set()
    for league in seed:
        seed_list = seed[league]
        if len(seed_list) != 4:
            raise Exception(
                f"Error: seed list for {league} is {len(seed_list)}, should be 4"
            )
        for t in seed_list:
            seed_team_names.add(t)

    # seed.json must have fewer teams than teams.json
    if len(seed_team_names) >= len(teams):
        raise Exception(
            f"Error: seed.json has too many teams: {len(seed_team_names)} should be <= {len(teams)}"
        )

    # seed.json teams must be a subset of teams.json teams
    if not set(seed_team_names).issubset(teams_team_names):
        err = "Error: mismatch in teams.json and seed.json team names:\n"
        err += f"seed.json team names: {', '.join(seed_team_names)}\n"
        err += f"teams.json team names: {', '.join(teams_team_names)}\n"
        raise Exception(err)

    # -----------
    # bracket
    bracketfile = os.path.join(seasondir, "bracket.json")

    print("***************************")
    print(f"Now checking {bracketfile}")

    if not os.path.exists(bracketfile):
        raise Exception(f"Error: missing file: {bracketfile}")

    with open(bracketfile, "r") as f:
        bracket = json.load(f)

    bracket_team_names = set()
    bracket_game_ids = set()
    for series in bracket:
        miniseason = bracket[series]
        for iday, day in enumerate(miniseason):
            check_bracket_day(day, series, iday)
            for game in day:
                bracket_team_names.add(game["team1Name"])
                bracket_team_names.add(game["team2Name"])
                if game["id"] in bracket_game_ids:
                    raise Exception(
                        f"Error: game id {game['id']} is a duplicate in the bracket!"
                    )
                else:
                    bracket_game_ids.add(game["id"])

    # Verify series are the correct lengths
    ldslen = len(bracket["LDS"])
    if ldslen != 5:
        raise Exception(
            f"Error: bracket LDS length is invalid: {ldslen} games, should be 5"
        )

    lcslen = len(bracket["LCS"])
    if lcslen != 7:
        raise Exception(
            f"Error: postseason LCS length is invalid: {lcslen} games, should be 7"
        )

    hcslen = len(bracket["HCS"])
    if hcslen != 7:
        raise Exception(
            f"Error: postseason HCS length is invalid: {hcslen} games, should be 7"
        )

    # bracket.json must have fewer teams than teams.json
    if len(bracket_team_names) >= len(teams):
        raise Exception(
            f"Error: bracket.json has too many teams: {len(bracket_team_names)} should be <= {len(teams)}"
        )

    # bracket.json teams must be a subset of teams.json teams
    ignore_list = ["Top Seed", "Bottom Seed", "Cold League", "Hot League"]
    ignore_list = set(ignore_list)
    bracket_team_names = bracket_team_names - ignore_list

    if not set(bracket_team_names).issubset(set(teams_team_names)):
        err = "Error: mismatch in teams.json and bracket.json team names:\n"
        err += f"bracket.json team names: {', '.join(sorted(bracket_team_names))}\n"
        err += f"teams.json team names: {', '.join(sorted(teams_team_names))}\n"
        err += f"Missing from teams: {', '.join(sorted(set(bracket_team_names) - set(teams_team_names)))}"
        raise Exception(err)

    # -----------
    # postseason

    postseasonfile = os.path.join(seasondir, "postseason.json")

    print("***************************")
    print(f"Now checking {postseasonfile}")

    if not os.path.exists(postseasonfile):
        raise Exception(f"Error: missing file: {postseasonfile}")

    with open(postseasonfile, "r") as f:
        postseason = json.load(f)

    postseason_team_names = set()
    postseason_game_ids = set()
    for series in postseason:
        miniseason = postseason[series]
        for iday, day in enumerate(miniseason):
            games = day
            for igame, game in enumerate(games):
                t1 = game["team1Name"]
                t2 = game["team2Name"]

                check_id(game)
                check_name_color_match(game)
                check_score(game)
                if series != "HCS":
                    check_league(game)
                check_map(game)
                check_game_season(game, iseason)

                postseason_team_names.add(t1)
                postseason_team_names.add(t2)
                if game["id"] in postseason_game_ids:
                    raise Exception(
                        f"Error: game id {game['id']} is a duplicate in the postseason!"
                    )
                else:
                    postseason_game_ids.add(game["id"])

    for abbr, series_name in ABBR_TO_NAME.items():
        miniseason = postseason[abbr]
        for day in miniseason:
            for game in day:
                check_postseason_game_descr(game, series_name)

    team_names = set()
    for team in teams:
        team_names.add(team["teamName"])
    for postseason_team_name in postseason_team_names:
        if postseason_team_name not in team_names:
            raise Exception(
                f"Error: invalid team name {postseason_team_name} found in postseason.json"
            )

    # Verify series are the correct lengths
    ldslen = len(postseason["LDS"])
    if ldslen > 5 or ldslen < 3:
        raise Exception(f"Error: postseason LDS length is invalid: {ldslen} games")

    lcslen = len(postseason["LCS"])
    if lcslen > 7 or lcslen < 4:
        raise Exception(f"Error: postseason LCS length is invalid: {lcslen} games")

    hcslen = len(postseason["HCS"])
    if hcslen > 7 or hcslen < 4:
        raise Exception(f"Error: postseason HCS length is invalid: {hcslen} games")

    # postseason.json must have fewer teams than postseason.json
    if len(postseason_team_names) >= len(teams):
        raise Exception(
            f"Error: postseason.json has too many teams: {len(postseason_team_names)} should be <= {len(teams)}"
        )

    # postseason.json must have same number of teams as bracket.json
    pbeqlen = len(postseason_team_names) != len(bracket_team_names)
    pbeq = sorted(list(postseason_team_names)) != sorted(list(bracket_team_names))
    if pbeqlen or pbeq:
        err = "Error: mismatch in postseason.json and bracket.json team names:\n"
        err += f"bracket.json team names: {', '.join(bracket_team_names)}\n"
        err += f"postseason.json team names: {', '.join(postseason_team_names)}\n"
        raise Exception(err)

    # skip checking that team names are the same, bracket has team name placeholders

    # postseason.json game ids must be a subset of bracket.json game ids
    diff = postseason_game_ids - bracket_game_ids
    if len(diff) > 0:
        err = "Error: mismatch in game IDs, game IDs found in postseason.json but not in bracket.json:\n"
        for gameid in sorted(list(diff)):
            err += f" - {gameid}\n"
        raise Exception(err)

    days = postseason['HCS']
    for day in days:
        game = day[0]
        s1 = game['team1Abbr'].upper() in CHOKE_ARTISTS
        s2 = game['team2Abbr'].upper() in CHOKE_ARTISTS
        if s1:
            choker = game['team1Abbr']
        if s2:
            choker = game['team2Abbr']
        if s1 or s2:
            err = f"Error: choke artist {choker} "
            err += "showed up in the championship series!!"
            raise Exception(err)


print("***************************")
print("Everything is okay")
