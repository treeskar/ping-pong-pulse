rm -rf coverage
cd api
rm -rf coverage
npm run coverage
cd ../ui
rm -rf coverage
npm run test
cd ../
node_modules/.bin/istanbul-combine -b ./ -d coverage -p summary -r lcov api/coverage/coverage-final.json ui/coverage/coverage-final.json
