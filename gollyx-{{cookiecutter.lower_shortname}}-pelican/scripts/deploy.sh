#!/bin/bash

set -euo pipefail

DRY_RUN=""

if [ -z ${GOLLYX_PELICAN_HOME+x} ]; then
	echo 'You must set the $GOLLYX_PELICAN_HOME environment variable to proceed.'
    echo 'Try sourcing environment.{STAGE}'
	exit 1
else
	echo "\$GOLLYX_PELICAN_HOME is set to '$GOLLYX_PELICAN_HOME'"
fi

if [ -z ${GOLLYX_STAGE+x} ]; then
	echo 'You must set the $GOLLYX_STAGE environment variable to proceed.'
    echo 'Try sourcing environment.{STAGE}'
	exit 1
else
	echo "\$GOLLYX_STAGE is set to '$GOLLYX_STAGE'"
fi

# Check for command line flag `--dry-run`
if [[ $# > 0 ]]; then
    if [[ "$1" == "--dry-run" ]]; then
        DRY_RUN="--dry-run"
    else
        echo "Error: unrecognized argument provided."
        echo "Only valid input argument is --dry-run."
        exit 1;
    fi
fi

# Figure out the domain for the given stage
case ${GOLLYX_STAGE} in
    integration)
    DOM="${GOLLYX_BASE_UI}"
    REPO="{{cookiecutter.lower_shortname}}.golly.life-integration"
    ;;
    prod)
    DOM="${GOLLYX_BASE_UI}"
    REPO="{{cookiecutter.lower_shortname}}.golly.life"
    ;;
    *)
    echo "Unrecognized stage: ${GOLLYX_STAGE}"
    echo "Must be: integration, prod"
    exit 1
    ;;
esac

echo "Cloning repo github.com/golly-splorts/${REPO}"

(
cd ${GOLLYX_PELICAN_HOME}/pelican
rm -fr output
git clone -b gh-pages https://github.com/golly-splorts/${REPO}.git output

rm -fr output/*

echo "Generating pelican content..."
pelican content

(
echo "Committing new content..."
cd output

git config user.name "Gollyx Orchestrator"
git config user.email "orchestrator@golly.life"

echo $DOM > CNAME

git add -A .

git commit -a -m "Automatic deploy of ${GOLLYX_STAGE} at $(date -u +"%Y-%m-%d-%H-%M-%S")"

RESULT=$?
if [ $RESULT -eq 0 ]; then
    echo "Git commit step succeeded"
else
    echo "Git commit step failed"
    echo "Cleaning up"
    echo rm -fr output
    exit 1
fi

if [[ $DRY_RUN == "--dry-run" ]]; then
    echo "Skipping push step, --dry-run flag present"
else
    echo "Pushing to remote"
    git push origin gh-pages
fi
)

echo "Cleaning up"
rm -fr output
)
