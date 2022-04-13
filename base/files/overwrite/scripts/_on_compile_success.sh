#!/bin/bash

set -eo pipefail

yarn lint --short

echo
echo "Testing..."

export NODE_ENV=development

if [[ $1 == 'ALL' ]] ; then
  echo "Note: 'testall' runs scripts with prefix 'skip-' as well."
  mocha --exit --trace-warnings -r source-map-support/register -c "build/test/**/@(skip-|)*.unit.test.js" 3>&2 2>&1 1>&3- | bunyan -L -o short -l fatal &
else
  mocha --exit --trace-warnings -r source-map-support/register -c "build/test/**/@(*$1*|$1*.unit.test).js" 3>&2 2>&1 1>&3- | bunyan -L -o short &
fi

# yarn doc > /dev/null &
yarn _copylib > /dev/null &

wait

echo "+===================================================+"
echo "| In watch mode, it will auto restart on code change. Ctrl-C to exit. |"
echo "+===================================================+"