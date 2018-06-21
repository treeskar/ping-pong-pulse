cd api
npm i
cd ../ui
npm i
cd ../
docker-compose -p pingpongpulsedev -f docker/docker-compose-dev.yml up -d --build
cd ui
node_modules/.bin/ng serve -o
