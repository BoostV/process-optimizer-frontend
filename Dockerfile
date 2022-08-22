FROM nginx
COPY ./out /usr/share/nginx/html
COPY ./docker-entrypoint.sh /docker-entrypoint.d

ENV API_URL=http://localhost:9090/v1.0

