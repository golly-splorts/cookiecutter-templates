#!/bin/bash
set -euo pipefail

echo "X X X X X X X X X X X X X X X X X X X X X X X X X"
echo "X X X X X X X X X X X X X X X X X X X X X X X X X"
echo "welcome to the zappa lambda function undeployer!"
echo "X X X X X X X X X X X X X X X X X X X X X X X X X"
echo "X X X X X X X X X X X X X X X X X X X X X X X X X"

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
    echo "Found an existing zappa lambda deployment for stage ${GOLLYX_STAGE}. Undeploying..."
    $ZAPPA undeploy $GOLLYX_STAGE
    echo "Finished deploying zappa lambda function"
else
    echo "No zappa lambda deployment found for stage ${GOLLYX_STAGE}"
    echo "No undeploy action was taken"
fi
)

