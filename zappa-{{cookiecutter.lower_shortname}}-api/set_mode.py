from datetime import timedelta, datetime
import pytz
import json
import sys
import os
import argparse


STAGE = "integration"  # should not change
DPS = 49


def main(sysargs=sys.argv[1:]):

    parser, args = get_argument_parser(sysargs)

    if(len(sys.argv)==1):
        parser.print_help(sys.stderr)
        sys.exit(1)

    else:
        write_fake_env(args)
        rewrite_settings(args)


def get_argument_parser(sysargs):
    desc = "Modify the zappa_settings.json file for the API application to put the API in a user-specified mode/season"
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument("mode", type=int, help="The mode to put the API app into")
    parser.add_argument("season", type=int, help="The season to put the API app into")
    args = parser.parse_args(sysargs)
    return parser, args


def write_fake_env(args):
    start_date, start_hour = get_start_date_hour(args.mode, args.season)
    contents = [
        '#!/bin/bash',
        'set -a',
        '',
        f'export GOLLYX_CLOUD_START_DATE="{start_date}"',
        f'export GOLLYX_CLOUD_START_HOUR="{start_hour}"',
        'export GOLLYX_STAGE="integration"',
    ]
    contents_str = "\n".join(contents)
    with open('fake_environment', 'w') as f:
        f.write(contents_str)
    print("Finished writing fake_environment")


def rewrite_settings(args):

    with open('zappa_settings.json', 'r') as f:
        zappa_settings = json.load(f)

    start_date, start_hour = get_start_date_hour(args.mode, args.season)

    zappa_settings[STAGE]['environment_variables']['GOLLYX_CLOUD_START_DATE'] = start_date
    zappa_settings[STAGE]['environment_variables']['GOLLYX_CLOUD_START_HOUR'] = start_hour

    with open('zappa_settings.json', 'w') as f:
        json.dump(zappa_settings, f, indent=4)

    print("Finished writing zappa_settings.json")
    print(f"    start_date={start_date}")
    print(f"    start_hour={start_hour}")
    print("")


def get_start_date_hour(mode, season0):

    time_zone = pytz.timezone("US/Pacific")
    dtnow = datetime.now(time_zone)

    ONE_DAY = 24

    # Start our gold starttime as now minus one week per season
    gold_start = dtnow - timedelta(weeks=season0)

    if mode < 10:
        # mode < 10: pre-season
        # shift the gold_start up by two hours
        # (season starts in 2 hours)
        gold_start += timedelta(hours=2)

    elif mode < 20:
        # mode < 20: regular season
        # shift the gold_start back by two hours
        # (Day 3)
        gold_start -= timedelta(hours=2)

    elif mode==21:
        # mode 21: season over, waiting for postseason to start
        gold_start -= timedelta(hours=DPS)

    elif mode==31:
        # mode 31: LDS
        gold_start -= timedelta(hours=DPS + 2)

    elif mode==22:
        # mode 22: LDS over, waiting for LCS
        gold_start -= timedelta(hours=DPS + 9)

    elif mode==32:
        # mode 32: LCS
        gold_start -= timedelta(hours=3*ONE_DAY+1)

    elif mode==23:
        # mode 23: LCS over, waiting for cup
        gold_start -= timedelta(hours=3*ONE_DAY+9)

    elif mode==33:
        # mode 33: cup
        gold_start -= timedelta(hours=4*ONE_DAY+1)

    elif mode>=40:
        # mode > 40: cup is over
        gold_start -= timedelta(hours=4*ONE_DAY+9)

    else:
        raise Exception("Invalid mode specified!")

    start_date = datetime.strftime(gold_start, "%Y-%m-%d")
    start_hour = datetime.strftime(gold_start, "%-H")

    return start_date, start_hour


if __name__ == '__main__':
    main()
