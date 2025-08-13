# cookiecutter-templates

This repository houses cookiecutter templates
for each of the repository types used by new
Hellmouth or Star Cups.

Each repository type's cookie cutter template
lives on an independent (orphan) branch, so that
each cookie cutter can live in the same repo
but remain completely independent.

## List of Repository Types

Hellmouth Cup repository types:

* `gollyx--pelican` - branch containing pelican template
* `gollyx--pelican-theme` - branch containing pelican theme template
* `gollyx--data` - branch containing (real) season data
* `gollyx--test-data` - branch containing (test) season data 
* `zappa--api` - branch containing contents of zappa API folder for gollyx-cloud

## Usage

To use the cookie cutter templates:

First, modify `cookiecutter.json` to fit your project specifications.

Second, install cookiecutter (ideally into a virtual environment):

```
pip install cookiecutter
```

Third, use the cookiecutter template in this directory (.):

```
cookiecutter --no-input .
```
