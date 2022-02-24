#!/bin/bash

set -e

source ./scripts/npm/get-registry.sh

get_ngiq_npm_registry $1

echo "Login NPM Registry https://${NGIQ_NPM_REGISTRY_HOST}/${NGIQ_NPM_REGISTRY_URI} with user ${NGIQ_NPM_USERNAME}"

password=$(aws ssm get-parameter --name /common/cicd/jenkins/${username}_password --with-decryption | jq -r .Parameter.Value)

token=$(curl -s \
  -H "Accept: application/json" \
  -H "Content-Type:application/json" \
  -X PUT --data "{\"name\": \"${NGIQ_NPM_USERNAME}\", \"password\": \"${password}\"}" \
  https://${NGIQ_NPM_REGISTRY_HOST}/${NGIQ_NPM_REGISTRY_URI}/-/user/org.couchdb.user:${NGIQ_NPM_USERNAME} | jq -r .token)

# .npmrc
# @ngiq:registry=https://registry.neuralgalaxy.net/repository/npm-group
# //registry.neuralgalaxy.net/repository/:_authToken=NpmToken.xxxx

rm -rf .npmrc
echo -e "@ngiq:registry=https://${NGIQ_NPM_REGISTRY_HOST}/${NGIQ_NPM_REGISTRY_URI}" >> .npmrc
echo -e "//${NGIQ_NPM_REGISTRY_HOST}/:_authToken=${token}" >> .npmrc

echo "Login NPM Registry succeeded"

