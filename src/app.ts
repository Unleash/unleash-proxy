import compression from 'compression';
import express, { Application } from 'express';
import cors from 'cors';
import Client, { IClient } from './client';
import { createProxyConfig, IProxyOption } from './config';

import UnleashProxy from './unleash-proxy';
import { OpenApiService } from './openapi/openapi-service';
import requireContentType from './content-type-checker';

export function createApp(
    options: IProxyOption,
    unleashClient?: IClient,
    app: Application = express(),
): Application {
    const config = createProxyConfig(options);
    const { logger } = config;
    logger.debug('Configuration:', config);
    const client = unleashClient || new Client(config);

    const openApiService = new OpenApiService(config);

    if (config.enableOAS) {
        openApiService.useDocs(app);
    }

    const proxy = new UnleashProxy(client, config, openApiService);

    app.disable('x-powered-by');
    try {
        app.set('trust proxy', config.trustProxy);
    } catch (err) {
        logger.error(
            `The provided "trustProxy" option was not valid ("${config.trustProxy}")`,
            err,
        );
    }

    if (typeof options.preHook === 'function') {
        options.preHook(app);
    }

    const corsOptions = config.cors;
    app.use(cors(corsOptions));

    app.use(compression());

    app.use(requireContentType());

    app.use(
        `${config.proxyBasePath}/proxy`,
        cors(corsOptions),
        express.json(),
        proxy.middleware,
    );
    openApiService.useErrorHandler(app);
    return app;
}

module.exports = { createApp };
