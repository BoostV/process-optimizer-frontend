FROM node:14.16.1 AS builder

WORKDIR /app
COPY . .

RUN yarn && yarn build

FROM node:14.16.1
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
