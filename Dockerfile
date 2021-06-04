FROM node:14-alpine as builder

WORKDIR /unleash-proxy

COPY . .

RUN npm ci

RUN npm run build

RUN npm prune --production

FROM node:14-alpine

ENV NODE_ENV production

WORKDIR /unleash-proxy

COPY --from=builder /unleash-proxy /unleash-proxy

EXPOSE 4242

USER node

CMD node dist/server
