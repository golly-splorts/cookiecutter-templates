#!/bin/bash
set -euo pipefail

echo "welcome to the zappa lambda function deployer!"

if [ -z "${GOLLYX_STAGE}" ]; then
	echo 'You must set the $GOLLYX_STAGE environment variable to proceed.'
	exit 1
fi

HERE=$(realpath $(dirname $0))

(
cd $HERE

ZAPPA=".venv/bin/zappa"
RC=0

$ZAPPA status $GOLLYX_STAGE || RC=$?
if [[ $RC == 0 ]]; then
    echo "Found an existing zappa lambda deployment. Updating..."
    $ZAPPA update $GOLLYX_STAGE
else
    echo "Did not find a zappa lambda function. Deploying..."
    $ZAPPA deploy $GOLLYX_STAGE
fi
echo "Finished deploying zappa lambda function"
)
