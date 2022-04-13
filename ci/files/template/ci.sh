#!/bin/bash

# if [[ ! -n $CI_COMMIT_REF_NAME ]]; then
#   echo "Please run 'yarn build|test|testall' instead"
#   exit 1
# fi

set -euo pipefail

export NODE_ENV=development

# mrm validate --preset @ses/mrm-preset

yarn clean

echo '>>> Compiling...'

yarn -s compile --mode=production
yarn _copylib

echo '>>> Testing...'
echo '(Detail log and report are generated under reports folder)'

mkdir -p reports

nyc mocha --exit -r source-map-support/register --reporter mochawesome --reporter-options reportDir=reports/testcase,reportFilename=index,quiet=true 'build/test/**/*.unit.test.js' 3>&2 2>&1 1>&3- | tee reports/testlog.json | bunyan -L -o short -l fatal

nyc check-coverage --lines ${lines} --functions ${functions} --statements ${statements} --branches ${branches}

echo '>>> Linting...'
echo '(Detail report is generated under reports folder)'

set +o pipefail
eslint -f stylish --ext .ts,.js src | tee reports/eslint.txt | grep ERROR || true
errors=`grep ERROR reports/eslint.txt | wc -l`
if (( errors > 0 )); then
  echo "There are lint errors"
  exit 1
fi
warnings=`grep WARNING reports/eslint.txt | wc -l`
echo "Lint warnings:" $warnings
if (( warnings > ${lint_warnings} )); then
  echo "Too many lint warnings! Should below ${lint_warnings}"
  exit 1
fi

echo
echo '>>> Check duplicated code...'
echo

yarn -s cpd

# echo
# echo '>>> Generating gitlab pages...'
# echo

# yarn -s pages:build
