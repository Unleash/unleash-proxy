FROM node:20-alpine as builder

WORKDIR /unleash-proxy

COPY . .

RUN corepack enable

ENV YARN_ENABLE_SCRIPTS=false

RUN yarn install --immutable

RUN yarn build

RUN yarn workspaces focus -A --production

FROM node:20-alpine

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

EXPOSE 3000

USER node

CMD ["./server.sh"]
