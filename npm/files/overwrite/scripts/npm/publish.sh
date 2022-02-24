#!/bin/bash

set -e

source ./scripts/npm/get-registry.sh

get_ngiq_npm_registry true

npm publish --registry https://${NGIQ_NPM_REGISTRY_HOST}/${NGIQ_NPM_REGISTRY_URI}/