#!/bin/bash

set -e

LOCAL_VERSION=$(elefanto/get_local_version.sh)
ARTIFACTORY_USER=$1
ARTIFACTORY_TOKEN=$2
EXTRA_INDEX_URL=https://${ARTIFACTORY_USER}:${ARTIFACTORY_TOKEN}@artifactory.boschdevcloud.com/artifactory/api/pypi/athena-pypi-atiswp-local/simple
REMOTE_PACKAGE_INFO=$(pip index --extra-index-url ${EXTRA_INDEX_URL} versions elefanto)
REMOTE_ALL_VERSIONS=$(grep 'Available versions: [0-9 \.,]*' <<< ${REMOTE_PACKAGE_INFO})

if [[ "$LOCAL_VERSION" == *"dev"* ]]; then
  echo "current local version $LOCAL_VERSION is a development version, no conflict with released versions"
elif [[ "$REMOTE_ALL_VERSIONS" == *"$LOCAL_VERSION"* ]]; then
  echo "The latest local version $LOCAL_VERSION in changelog already exists in artifactory, please use a new version!"
  exit 1
else
  echo "Version $LOCAL_VERSION will be released after merging this PR into master."
fi
