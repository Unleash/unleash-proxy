import express, { Application } from 'express';
import cors from 'cors';
import Client, { IClient } from './client';
import { createProxyConfig, IProxyOption } from './config';

import UnleashProxy from './unleash-proxy';

const corsOptions = {
    exposedHeaders: 'ETag',
    maxAge: 604800,
};

export function createApp(
    options: IProxyOption,
    unleashClient?: IClient,
    app: Application = express(),
): Application {
    const config = createProxyConfig(options);
    const client = unleashClient || new Client(config);

    const proxy = new UnleashProxy(client, config);

    app.disable('x-powered-by');
    app.set('trust proxy', config.trustProxy);
    app.use(cors(corsOptions));
    app.set('trust proxy', true);
    app.use(
        `${config.proxyBasePath}/proxy`,
        cors(corsOptions),
        express.json(),
        proxy.middleware,
    );
    return app;
}

module.exports = { createApp };
