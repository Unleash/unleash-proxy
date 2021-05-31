import express, { Application } from 'express';
import cors from 'cors';
import Client from './client';
import { createProxyConfig, IProxyOption } from './config';

import UnleashProxy from './unleash-proxy';

const corsOptions = {
    exposedHeaders: 'ETag',
    maxAge: 604800
}

function createApp(options: IProxyOption, unleashClient?: Client, app: Application = express()) {
    const config = createProxyConfig(options);
    const client = unleashClient || new Client(config);

    const proxy = new UnleashProxy(client, config);

    app.disable('x-powered-by');
    app.use(cors(corsOptions));
    app.use(`${config.proxyBasePath}/proxy`, cors(corsOptions), express.json(), proxy.middleware);
    return app;
}

module.exports = { createApp } ;