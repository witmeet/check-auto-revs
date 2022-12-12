#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ ! $CHANGELOG_PATH ]
then
  CHANGELOG_PATH="$DIR/../CHANGELOG.md"
fi

LOCAL_VERSION=`grep '^## \[\?[0-9]\+\.[0-9]\+\.[0-9].*\]\? - ' $CHANGELOG_PATH |
head -n 1 |
awk '{print $2}' |
tr -d '[]'`

echo $LOCAL_VERSION
