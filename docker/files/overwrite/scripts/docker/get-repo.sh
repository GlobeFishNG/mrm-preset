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
    repo_namespace=ngiq-cr
    repo_domain=$(aliyun cr GetRepo --RepoName=${npm_package_name} --RepoNamespace=${repo_namespace} | jq -r .data.repo.repoDomainList.public)  
    if [[ -z $repo_domain ]]; then
      echo "Cannot find repository ${npm_package_name}  - please create it manually in the CR console"
      exit 1
    fi
    repo_uri="${repo_domain}/${repo_namespace}/$npm_package_name"
  fi
  export NGIQ_DOCKER_REPO_URI=${repo_uri}
  export NGIQ_DOCKER_REPO_DOMAIN=${repo_domain}
}