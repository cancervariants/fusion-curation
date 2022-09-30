#!/bin/sh

yarn --cwd client install
yarn --cwd client build
cp -R client/build server/curfu

pip install server/
