#!/bin/bash

set -eo pipefail

yarn clean
if [[ "$npm_package_config_type" == "service" ]]; then
  yarn compile:genapicode
fi
yarn format

if [[ $1 == "--watch" ]]; then
  tsc-watch --onSuccess "yarn _on_compile_success ALL" --onFailure "yarn _on_compile_failure"
else
  yarn compile:typescript && yarn _on_compile_success ALL || yarn _on_compile_failure
  echo "Note: run 'yarn testall --watch' to enable watch mode"  
fi