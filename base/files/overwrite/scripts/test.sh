#!/bin/bash

# $ yarn test <testcase_name>
#
# Run test cases which file name partially matches the given name
# To run skipped test (skip-*.ts), need to specify full name

set -eo pipefail

yarn clean
if [[ "$npm_package_config_type" == "service" ]]; then
  yarn compile:genapicode
fi
yarn format

if [[ $1 == "--watch" ]]; then
  tsc-watch --onSuccess "yarn _on_compile_success $2" --onFailure "yarn _on_compile_failure"
else
  yarn compile:typescript && yarn _on_compile_success $1 || yarn _on_compile_failure
  echo "Note: run 'yarn test --watch [test]' to enable watch mode"
fi
