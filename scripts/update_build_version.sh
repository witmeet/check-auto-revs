#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ ! $SETUP_PY_PATH ]
then
  SETUP_PY_PATH="$DIR/../setup.py"
fi

VERSION_SETUP=`python setup.py --version 2>/dev/null`

VERSION_CHANGELOG=$(scripts/get_local_version.sh)

if [[ "$VERSION_SETUP" != "\"$VERSION_CHANGELOG\"" ]]; then
  echo "Build version $VERSION_SETUP is not consistant with the changelog, update the build version to \"$VERSION_CHANGELOG\""
  git tag -a ${VERSION_CHANGELOG} -m "tag ${VERSION_CHANGELOG}"
  git push --tags
  sed -i -r "s/version=\".*\",/version=\"$VERSION_CHANGELOG\",/" $SETUP_PY_PATH
else
  echo "Build version $VERSION_SETUP is consistant with the changelog."
fi
