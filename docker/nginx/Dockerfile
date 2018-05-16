FROM nginx:1.10.2-alpine
COPY /ui/dist/ui /var/www/ppp

RUN rm /etc/nginx/conf.d/default.conf
COPY /docker/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443
