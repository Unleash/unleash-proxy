FROM node:24-alpine AS builder

WORKDIR /unleash-proxy

COPY . .

RUN corepack enable

ENV YARN_ENABLE_SCRIPTS=false

RUN yarn install --immutable

RUN yarn build

RUN yarn workspaces focus -A --production

##### Prod Image
FROM node:24-alpine
RUN apk add --no-cache tini

#TODO HACK to avoid CVE-2025-60876. Remove after the vulnerability is fixed
RUN apk update && apk upgrade --no-cache busybox busybox-binsh ssl_client

ENV NODE_ENV=production

WORKDIR /unleash-proxy

COPY --from=builder /unleash-proxy /unleash-proxy

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN chown -R node:node /unleash-proxy

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000

USER node

CMD ["./server.sh"]
