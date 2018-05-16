echo "Building API"
cd api
rm -rf dist/*
npm run build-ts
cd ../
echo "Building UI"
cd ui
rm -rf dist/*
ng build --prod --build-optimizer --aot
cd ../
cd docker
docker-compose -p pingpongpulse -f docker-compose-prod.yml up -d --build
