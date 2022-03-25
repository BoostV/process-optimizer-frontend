FROM node:16-bullseye AS builder

WORKDIR /app
COPY . .

RUN yarn --network-timeout 100000 && yarn build

FROM node:16-bullseye
RUN mkdir /app

WORKDIR /app

COPY --from=builder /app/node_modules/ node_modules
COPY --from=builder /app/.next/ .next
COPY package.json .

RUN addgroup --system user && adduser --system --group user
RUN chown -R user:user /app/.next

USER user
ENV DB_FOLDER=/tmp

EXPOSE 3000

CMD [ "yarn", "start" ]
