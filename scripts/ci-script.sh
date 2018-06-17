#/usr/bin/env/sh

# Test UI
cd api
npm i
npm test
cd ../ui
yarn
npm test
cd ../
