# gollyx-{{cookiecutter.lower_shortname}}-pelican-theme

Pelican theme for the the Hellmouth {{cookiecutter.upper_shortname}} Cup website.

Basically a clone of <https://github.com/golly-splorts/gollyx-v-pelican-theme> with some minor tweaks.

The Pelican theme consists of all elements of the UI that are common to
all pages of the Golly UI.

## Installation

To install the theme:

```
git clone <this repo>

# If theme is not installed, install it
pelican-themes -i gollyx-{{cookiecutter.lower_shortname}}-pelican-theme

# If theme is installed, update it
pelican-themes -U gollyx-{{cookiecutter.lower_shortname}}-pelican-theme
```

## Usage

To use this Pelican theme, set the theme to `gollyx-{{cookiecutter.lower_shortname}}-pelican-theme`
in `pelican.conf`.

```
THEME = 'gollyx-{{cookiecutter.lower_shortname}}-pelican-theme'
```
