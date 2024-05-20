FROM node:18-alpine as builder

WORKDIR /unleash-proxy

COPY . .

RUN yarn install --frozen-lockfile --ignore-scripts

RUN yarn build

RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

FROM node:18-alpine as server
RUN apk add --no-cache tini

##### Prod Image
FROM alpine:latest
COPY --from=server / /
#HACK fix for CVE-2024-28863
RUN npm install -g npm@10.5.2

#TODO HACK to avoid CVE-2024-2511. Remove after the vulnerability is fixed
#TODO HACK to avoid CVE-2023-42366. Remove after the vulnerability is fixed
RUN apk update && apk upgrade --no-cache libssl3 libcrypto3 busybox

ENV NODE_ENV production

WORKDIR /unleash-proxy

COPY --from=builder /unleash-proxy /unleash-proxy

RUN rm -rf /usr/local/lib/node_modules/npm/

RUN chown -R node:node /unleash-proxy

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 4242

USER node

CMD ./server.sh
