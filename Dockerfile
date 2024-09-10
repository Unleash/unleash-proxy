FROM node:18-alpine AS builder

WORKDIR /unleash-proxy

COPY . .

RUN yarn install --frozen-lockfile --ignore-scripts

RUN yarn build

RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:18-alpine AS server
RUN apk add --no-cache tini

##### Prod Image
FROM alpine:latest
COPY --from=server / /

#TODO HACK to avoid CVE-2024-5535. Remove after the vulnerability is fixed
RUN apk update && apk upgrade --no-cache libssl3 libcrypto3 openssl

ENV NODE_ENV=production

WORKDIR /unleash-proxy

COPY --from=builder /unleash-proxy /unleash-proxy

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN chown -R node:node /unleash-proxy

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 4242

USER node

CMD ["./server.sh"]
