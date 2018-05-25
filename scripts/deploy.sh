VERSION=$(jq -r ".version" package.json)
DOCKER_USER=$(yq r ansible/roles/app/defaults/main.yml 'docker_hub_username')
KYE_FILE_PATH=ansible/group_vars/all.yml
ansible-vault decrypt ${KYE_FILE_PATH} --vault-password-file ansible/vault-password
DOCKER_PASS=$(yq r ${KYE_FILE_PATH} 'docker_hub_password')
ansible-vault encrypt ${KYE_FILE_PATH} --vault-password-file ansible/vault-password

echo "Building API v${VERSION}"
cd api
rm -rf dist/*
npm run build
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
ansible-galaxy install -r requirements.yml
ansible-playbook -v -i prod.hosts playbook.yml --vault-password-file vault-password
