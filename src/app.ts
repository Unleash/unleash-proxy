import compression from 'compression';
import cors from 'cors';
import express, { type Application } from 'express';
import type { IClient } from './client';
import { type IProxyOption, createProxyConfig } from './config';

import requireContentType from './content-type-checker';
import { createNewClient, createSingletonClient } from './create-client';
import { OpenApiService } from './openapi/openapi-service';
import UnleashProxy from './unleash-proxy';

export function createApp(
    options: IProxyOption,
    unleashClient?: IClient,
    app: Application = express(),
): Application {
    const config = createProxyConfig(options);
    const { logger } = config;
    // Sanitize config before logging to avoid leaking sensitive information
    const sanitizedConfig = { ...config, unleashApiToken: '[REDACTED]' };
    logger.debug('Configuration:', sanitizedConfig);
    const client =
        unleashClient ||
        (options.clientMode === 'new'
            ? createNewClient(config)
            : createSingletonClient(config));

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

    // @ts-expect-error Express struggles with its types here, compression seems to be too old
    app.use(compression());

    app.use(
        `${config.proxyBasePath}/proxy`,
        requireContentType(),
        cors(corsOptions),
        express.json(),
        proxy.middleware,
    );
    openApiService.useErrorHandler(app);
    return app;
}

module.exports = { createApp };
