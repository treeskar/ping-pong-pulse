FROM node:alpine
WORKDIR /usr/src/api
COPY /api/package*.json ./
RUN npm config set strict-ssl false
RUN npm install --only=production
COPY /api/dist ./dist
RUN cd dist
EXPOSE 8999
CMD [ "node", "index.js" ]
