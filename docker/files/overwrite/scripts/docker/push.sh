#!/bin/bash

set -e

profile=${1:-default}

source scripts/docker/get-repo.sh

get_ngiq_docker_repo ${profile}

echo "Pushing docker image: ${NGIQ_DOCKER_REPO_URI}:${npm_package_version} ..."

docker tag ${npm_package_name}:${npm_package_version} ${NGIQ_DOCKER_REPO_URI}:${npm_package_version}
docker push ${NGIQ_DOCKER_REPO_URI}:${npm_package_version}

echo "Succeeded"