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
  export NGIQ_ALIYUN_CR_INSTANCE_ID="cri-2bp27pwaqbe7w5t2"
  aliyun cr GetAuthorizationToken --InstanceId $NGIQ_ALIYUN_CR_INSTANCE_ID \
    --force --version 2018-12-01 --region cn-hangzhou | \
    jq -r .AuthorizationToken | \
    docker login --username=cr_temp_user --password-stdin ${NGIQ_DOCKER_REPO_DOMAIN}
fi

echo "Succeeded"