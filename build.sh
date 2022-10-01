#!/bin/sh

yarn --cwd client install
yarn --cwd client build
cp -R client/build server/curfu

/var/app/venv/staging-LQM1lest/bin/pip install --user server/
