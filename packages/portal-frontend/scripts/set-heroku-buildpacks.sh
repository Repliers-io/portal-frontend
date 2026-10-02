#!/bin/bash

set -euo pipefail

# Function to display usage
usage() {
    echo "Usage: $0 <HEROKU_APP_NAME>"
    exit 1
}

# Check if app name is provided
if [ $# -ne 1 ]; then
    usage
fi

HEROKU_APP_NAME="$1"

heroku buildpacks:add --app "$HEROKU_APP_NAME" --index 1 https://github.com/lstoll/heroku-buildpack-monorepo
heroku buildpacks:add --app "$HEROKU_APP_NAME" --index 2 heroku/nodejs
