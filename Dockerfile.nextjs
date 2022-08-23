FROM node:16-bullseye AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000

FROM node:16-bullseye AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM node:16-bullseye
RUN mkdir /app

WORKDIR /app

COPY --from=builder /app/node_modules/ node_modules
COPY --from=builder /app/.next/ .next
COPY package.json .
COPY ./docker-entrypoint.sh /

RUN addgroup --system user && adduser --system --group user
RUN chown -R user:user /app/.next

USER user
EXPOSE 3000
ENV API_URL=http://localhost:9090/v1.0

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD [ "yarn", "start" ]
