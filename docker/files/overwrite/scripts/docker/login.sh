#!/bin/bash

set -e

profile=${1:-default}

source scripts/docker/get-repo.sh

get_ngiq_docker_repo ${profile}

echo "Logging in docker registry: $profile ..."

if [[ $profile =~ ((default)|(^aws)) ]]; then
  aws ecr get-login-password | \
    docker login --username AWS --password-stdin ${NGIQ_DOCKER_REPO_URI}
else
  aliyun cr GetAuthorizationToken | \
    jq -r .data.authorizationToken | \
    docker login --username=cr_temp_user --password-stdin ${NGIQ_DOCKER_REPO_DOMAIN}
fi

echo "Succeeded"