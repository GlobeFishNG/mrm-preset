#!/bin/bash

set -e

source ./scripts/npm/get-registry.sh

get_ngiq_npm_registry true

cp .npmrc dist_types/

pushd dist_types
  version=$(cat package.json | jq -r '.version')
  name=$(cat package.json | jq -r '.name')
  npm unpublish ${name}@${version} --registry https://${NGIQ_NPM_REGISTRY_HOST}/${NGIQ_NPM_REGISTRY_URI}/
popd