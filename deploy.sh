VERSION=$(jq -r ".version" package.json)
DOCKER_USER="pingpongpulse"
DOCKER_PASS="Pin9P0ngPu|se"

echo "Building API v${VERSION}"
cd api
rm -rf dist/*
npm run build-ts
cd ../
echo "Building UI v${VERSION}"
cd ui
rm -rf dist/*
ng build --prod --build-optimizer --aot
cd ../docker

# rebuild containers
docker-compose -p pingpongpulse -f docker-compose-prod.yml build
docker login --username=${DOCKER_USER} --password=${DOCKER_PASS}
echo "Tagging Docker images"
docker tag pingpongpulse_api pingpongpulse/api:${VERSION}
docker tag pingpongpulse_api pingpongpulse/api:latest
docker tag pingpongpulse_nginx pingpongpulse/nginx:${VERSION}
docker tag pingpongpulse_nginx pingpongpulse/nginx:latest
echo "Publishing v${VERSION}"
docker push pingpongpulse/api:${VERSION}
docker push pingpongpulse/api:latest
docker push pingpongpulse/nginx:${VERSION}
docker push pingpongpulse/nginx:latest
echo "Deploying v${VERSION}"
cd ../ansible
ansible-playbook -v -i prod.hosts playbook.yml
