#!/bin/bash

get_ngiq_npm_registry() {
  is_push=${1:-false}

  username="jenkins-dev"
  
  registry_host="registry.neuralgalaxy.net/repository"

  if [[ "${is_push}" = "true" ]]; then
    version=${npm_package_version}
    if [[ "$version" =~ ^([0-9]{1}).([0-9]{1,2}).([0-9]{1,2})$ ]]; then
      registry_uri="npm-hosted-release"
      username="jenkins"
    else
      registry_uri="npm-hosted-snapshots"
    fi
  else
    username="jenkins"
    registry_uri="npm-group"
  fi

  export NGIQ_NPM_USERNAME=${username}
  export NGIQ_NPM_REGISTRY_HOST=${registry_host}
  export NGIQ_NPM_REGISTRY_URI=${registry_uri}
}

