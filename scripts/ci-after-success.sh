#/usr/bin/env/sh

# After success UI test
npm run coverage
cat ./coverage/lcov.info | node_modules/.bin/coveralls
