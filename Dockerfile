FROM node:14-alpine as builder

WORKDIR /unleash-proxy

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

RUN yarn install --production  --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:14-alpine

ENV NODE_ENV production

WORKDIR /unleash-proxy

COPY --from=builder /unleash-proxy /unleash-proxy

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN chown -R node:node /unleash-proxy

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 4242

USER node

CMD ./server.sh
