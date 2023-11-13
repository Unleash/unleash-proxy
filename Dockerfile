FROM node:20-alpine as builder

WORKDIR /unleash-proxy

COPY . .

RUN yarn install --frozen-lockfile --ignore-scripts

RUN yarn build

RUN yarn install --production  --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:20-alpine

#TODO HACK to avoid CVE-2023-5363. Remove after the vulnerability is fixed
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3

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
