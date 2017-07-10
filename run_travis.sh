#!/usr/bin/env bash

# Fail if any command fails.
set -e

echo "running $RUNTEST tests"
export gulp=/home/travis/.nvm/versions/node/v8.1.3/lib/node_modules/gulp-cli/bin/gulp.js

if [ "$RUNTEST" == "frontend" ]; then
    /home/travis/.nvm/versions/node/v8.1.3/lib/node_modules/gulp-cli/bin/gulp.js "test:unit"
    gulp "test:coveralls"
elif [ "$RUNTEST" == "backend" ]; then
    tox
    flake8
    coveralls
elif [ "$RUNTEST" == "acceptance" ]; then
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start &
    sleep 3
    export HEADLESS_CHROME_BINARY=/usr/bin/google-chrome-beta
    gulp test:acceptance
fi
