FROM node:20-alpine AS builder

# TODO HACK to avoid CVE-2024-5535. Remove after the vulnerability is fixed
# Install npm and force cross-spawn version
# Remove old version and install new one
RUN npm install -g npm@10.9.0 && \
    # Remove old version
    npm uninstall -g cross-spawn && \
    npm cache clean --force && \
    # Find and remove any remaining old versions
    find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
    # Install new version
    npm install -g cross-spawn@7.0.5 --force && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true

WORKDIR /unleash-proxy

COPY . .

RUN corepack enable

ENV YARN_ENABLE_SCRIPTS=false

RUN yarn install --immutable

RUN yarn build

RUN yarn workspaces focus -A --production

FROM node:20-alpine AS server
RUN apk add --no-cache tini

# TODO HACK to avoid CVE-2024-5535. Remove after the vulnerability is fixed
# Install npm and force cross-spawn version
# Remove old version and install new one
RUN npm install -g npm@10.9.0 && \
    # Remove old version
    npm uninstall -g cross-spawn && \
    npm cache clean --force && \
    # Find and remove any remaining old versions
    find /usr/local/lib/node_modules -name "cross-spawn" -type d -exec rm -rf {} + && \
    # Install new version
    npm install -g cross-spawn@7.0.5 --force && \
    # Configure npm
    npm config set save-exact=true && \
    npm config set legacy-peer-deps=true

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
