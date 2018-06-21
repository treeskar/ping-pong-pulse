#/usr/bin/env/sh
set -ev
# Test UI
cd api
npm i
npm test
cd ../ui
npm i
npm test
npm run build
npm run integration:test
cd ../
