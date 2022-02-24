#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )"

ROOT_DIR=${PWD}

pushd ${SCRIPT_DIR}
  cp -r $ROOT_DIR/dist .
  cp $ROOT_DIR/package.json ./dist
  cp $ROOT_DIR/npm-shrinkwrap.json ./dist
  cp .env.production ./dist

  echo "Building docker image: ${npm_package_name}:${npm_package_version} ..."

  docker build \
    --build-arg IS_CN=$IS_CN \
    -t ${npm_package_name}:${npm_package_version} \
    . \
    --pull

  echo "Succeeded"
popd