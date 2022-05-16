#!/bin/bash

function get_ngiq_docker_repo() {
  profile=$1
  if [[ $profile =~ ((default)|(^aws)) ]]; then
    repo_uri=$(aws ecr describe-repositories --repository-names ${npm_package_name} | jq -r ".repositories[].repositoryUri")
    if [[ -z $repo_uri ]]; then
      echo "Cannot find repository ${npm_package_name} - please create it manually in the ECR console"
      exit -1
    fi
  else
    repo_domain="ngiq-registry.cn-hangzhou.cr.aliyuncs.com"
    if [[ $profile = "aliyun-prod" ]]; then
      repo_namespace=ngiq-prod-cr
    else
      repo_namespace=ngiq-cr
    fi
    repo_uri="${repo_domain}/${repo_namespace}/$npm_package_name"
  fi
  export NGIQ_DOCKER_REPO_URI=${repo_uri}
  export NGIQ_DOCKER_REPO_DOMAIN=${repo_domain}
}