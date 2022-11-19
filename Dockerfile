FROM nginx
COPY ./sample-app/dist /usr/share/nginx/html
COPY ./docker-entrypoint.sh /docker-entrypoint.d
COPY ./nginx-spa.conf /etc/nginx/conf.d/default.conf

ENV API_URL=http://localhost:9090/v1.0

