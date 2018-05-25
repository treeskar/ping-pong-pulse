#!/bin/bash

DIR=ansible/cert/
DOMAIN=$1
DEST=${DIR}${DOMAIN}/
PASSWORD="5rn:ebh?ptMB-AA}"

country=IL
state=Center
locality=TelAviv
organizationalUnit=PAN
email="afailteons@paloaltonetworks.com"

mkdir -p ${DEST}
echo "Generating key request for *.$DOMAIN"
#Generate a key
openssl genrsa -des3 -passout pass:${PASSWORD} -out ${DEST}${DOMAIN}.key 2048 -noout
#Remove passphrase from the key. Comment the line out to keep the passphrase
openssl rsa -in ${DEST}${DOMAIN}.key -passin pass:${PASSWORD} -out ${DEST}${DOMAIN}.key
#Create the request
echo "Creating CSR"
openssl req -new -key ${DEST}${DOMAIN}.key -out ${DEST}${DOMAIN}.csr -passin pass:${PASSWORD} \
    -subj "/C=$country/ST=$state/L=$locality/O=$DOMAIN/OU=$organizationalUnit/CN=*.${DOMAIN}/emailAddress=$email"
openssl x509 -req -days 365 -in ${DEST}${DOMAIN}.csr -signkey ${DEST}${DOMAIN}.key -out ${DEST}${DOMAIN}.crt
echo "Creating private PEM"
openssl rsa -in ${DEST}${DOMAIN}.key -text > ${DEST}${DOMAIN}-private.pem
echo "Creating public PEM"
openssl x509 -inform PEM -in ${DEST}${DOMAIN}.crt > ${DEST}${DOMAIN}-public.pem
echo "add private key to keychain"
chmod 400 ${DEST}${DOMAIN}-private.pem
ssh-add -K ${DEST}${DOMAIN}-private.pem
chmod 644 ${DEST}${DOMAIN}-private.pem

echo "Encrypt keys"
FILES=(".crt" ".csr" ".key" "-private.pem" "-public.pem")
for postfix in "${FILES[@]}"
do
 ansible-vault encrypt ${DEST}${DOMAIN}${postfix} --vault-password-file ansible/vault-password
done
