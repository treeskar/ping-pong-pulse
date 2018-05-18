echo "Building API"
cd api
rm -rf dist/*
npm run build
cd ../
echo "Building UI"
cd ui
rm -rf dist/*
ng build --prod --build-optimizer --aot
cd ../docker
# instantly run created containers in demon mode
docker-compose -p pingpongpulse -f docker-compose-prod.yml up -d --build
