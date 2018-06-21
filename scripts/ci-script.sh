#/usr/bin/env/sh

# Test UI
cd api
npm i
npm test
cd ../ui
npm i
npm test
npm run build:prod
npm run integration:test
cd ../
