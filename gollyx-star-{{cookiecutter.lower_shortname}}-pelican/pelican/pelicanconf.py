import os, re, glob


GOLLYX_PELICAN_VERSION = "{{cookiecutter.cup_number}}01.0.0"


# Yes, this is supposed to be UI not URI...
SITEURL = os.environ.get('GOLLYX_BASE_UI', '')

AUTHOR = u'Ch4zm of Hellmouth'

HERE = os.path.abspath(os.path.dirname(__file__))

stage = os.environ.get('GOLLYX_STAGE', '')

SITENAME = u'Star {{cookiecutter.upper_shortname}} Cup'

PATH = 'content'
THEME = 'gollyx-star-{{cookiecutter.lower_shortname}}-pelican-theme'

# Don't try to turn HTML files into pages
READERS = {'html': None}

# Static stuff
STATIC_PATHS = ['img']


# --------------------
# Map template pages to their final file name

TEMPLATE_PAGES = {}

TEMPLATE_PAGES['index.html'] = 'index.html'
TEMPLATE_PAGES['index.js'] = 'index.js'

TEMPLATE_PAGES['season.html'] = 'season.html'
TEMPLATE_PAGES['season.js'] = 'season.js'

TEMPLATE_PAGES['postseason.html'] = 'postseason.html'
TEMPLATE_PAGES['postseason.js'] = 'postseason.js'

TEMPLATE_PAGES['league.html'] = 'league.html'
TEMPLATE_PAGES['league.js'] = 'league.js'

TEMPLATE_PAGES['maps.html'] = 'maps.html'
TEMPLATE_PAGES['maps.js'] = 'maps.js'

# --------------------
# Add custom routes

THEME_TEMPLATES_OVERRIDES = []

THEME_TEMPLATES_OVERRIDES.append('simulator')
TEMPLATE_PAGES['simulator/star_life.html'] = 'simulator/index.html'
TEMPLATE_PAGES['simulator/star_life.js']   = 'simulator/star_life.js'

# minilife app is used on multiple pages,
# so it lives in golly-pelican-theme

# These two env vars are used via Jinja in golly-pelican-theme (header.html) to set API/UI base URLs.
# If they are empty strings, we use Javscript to deduce the base UI URL,
# and insert "api." beteen the protocol and base URL to get the API URL.
GOLLYX_BASE_UI = os.environ.get('GOLLYX_BASE_UI', '')
GOLLYX_BASE_API = os.environ.get('GOLLYX_BASE_API', '')
GOLLYX_MAPS_API = os.environ.get('GOLLYX_MAPS_API', '')


# --------------------
# SHUT UP

ARCHIVES_SAVE_AS = ''
AUTHOR_SAVE_AS = ''
AUTHORS_SAVE_AS = ''
CATEGORY_SAVE_AS = ''
CATEGORIES_SAVE_AS = ''
DAY_SAVE_AS = ''
INDEX_SAVE_AS = ''
MONTH_ARCHIVE_SAVE_AS = ''
TAGS_SAVE_AS = ''
YEAR_ARCHIVE_SAVE_AS = ''


# ---------------------

# No feeds
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
DEFAULT_PAGINATION = False
TIMEZONE = 'America/Los_Angeles'

