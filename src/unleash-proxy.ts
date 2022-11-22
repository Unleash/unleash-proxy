import { Request, Response, Router } from 'express';
import { Context } from 'unleash-client';
import { createContext } from './create-context';
import { IProxyConfig } from './config';
import { IClient } from './client';
import { ContextEnricher, enrichContext } from './enrich-context';
import { Logger } from './logger';
import { OpenApiService } from './openapi/openapi-service';
import { featuresResponse } from './openapi/spec/features-response';
import { NOT_READY_MSG, standardResponses } from './openapi/common-responses';
import { apiRequestResponse } from './openapi/spec/api-request-response';
import { prometheusRequestResponse } from './openapi/spec/prometheus-request-response';
import { ApiRequestSchema } from './openapi/spec/api-request-schema';
import { FeaturesSchema } from './openapi/spec/features-schema';
import { lookupTogglesRequest } from './openapi/spec/lookup-toggles-request';
import { registerMetricsRequest } from './openapi/spec/register-metrics-request';
import { registerClientRequest } from './openapi/spec/register-client-request';
import {
    createDeepObjectRequestParameters,
    createRequestParameters,
} from './openapi/openapi-helpers';
import { RegisterMetricsSchema } from './openapi/spec/register-metrics-schema';
import { LookupTogglesSchema } from './openapi/spec/lookup-toggles-schema';
import { RegisterClientSchema } from './openapi/spec/register-client-schema';

export default class UnleashProxy {
    private logger: Logger;

    private clientKeys: string[];

    private serverSideTokens: string[];

    private clientKeysHeaderName: string;

    private client: IClient;

    private contextEnrichers: ContextEnricher[];

    private ready = false;

    public middleware: Router;

    private enableAllEndpoint = false;

    constructor(
        client: IClient,
        config: IProxyConfig,
        openApiService: OpenApiService,
    ) {
        this.logger = config.logger;
        this.clientKeys = config.clientKeys;
        this.serverSideTokens = config.serverSideSdkConfig
            ? config.serverSideSdkConfig.tokens
            : [];
        this.clientKeysHeaderName = config.clientKeysHeaderName;
        this.client = client;
        this.enableAllEndpoint = config.enableAllEndpoint || false;
        this.contextEnrichers = config.expCustomEnrichers
            ? config.expCustomEnrichers
            : [];

        if (client.isReady()) {
            this.setReady();
        }

        this.client.on('ready', () => {
            this.setReady();
        });

        const router = Router();
        this.middleware = router;

        // Routes
        router.get(
            '',
            openApiService.validPath({
                parameters: [
                    ...createRequestParameters({
                        appName: "Your application's name",
                        userId: "The current user's ID",
                        sessionId: "The current session's ID",
                        remoteAddress: "Your application's IP address",
                    }),
                    ...createDeepObjectRequestParameters({
                        properties: {
                            description: 'Additional (custom) context fields',
                            example: {
                                region: 'Africa',
                                betaTester: 'true',
                            },
                        },
                    }),
                ],
                responses: {
                    ...standardResponses(401, 500, 503),
                    200: featuresResponse,
                },
                description:
                    'This endpoint returns the list of feature toggles that the proxy evaluates to enabled for the given context. Context values are provided as query parameters.',
                summary:
                    'Retrieve enabled feature toggles for the provided context.',
                tags: ['Proxy client'],
            }),
            this.getEnabledToggles.bind(this),
        );

        router.get(
            '/all',
            openApiService.validPath({
                parameters: [
                    ...createRequestParameters({
                        appName: "Your application's name",
                        userId: "The current user's ID",
                        sessionId: "The current session's ID",
                        remoteAddress: "Your application's IP address",
                    }),
                    ...createDeepObjectRequestParameters({
                        properties: {
                            description: 'Additional (custom) context fields',
                            example: {
                                region: 'Africa',
                                betaTester: 'true',
                            },
                        },
                    }),
                ],
                responses: {
                    ...standardResponses(401, 500, 501, 503),
                    200: featuresResponse,
                },
                description:
                    'This endpoint returns the list of feature toggles that the proxy evaluates to enabled and disabled for the given context. As such, this endpoint always returns all feature toggles the proxy retrieves from unleash. Useful if you are migrating to unleash and need to know if the feature flag exists on the unleash server. However, using this endpoint will increase the payload size transmitted to your applications. Context values are provided as query parameters.',
                summary:
                    'Retrieve enabled feature toggles for the provided context.',
                tags: ['Proxy client'],
            }),
            this.getAllToggles.bind(this),
        );

        router.post(
            '',
            openApiService.validPath({
                requestBody: lookupTogglesRequest,
                responses: {
                    ...standardResponses(400, 401, 500, 503),
                    200: featuresResponse,
                },
                description:
                    'This endpoint accepts a JSON object with `context` and `toggles` properties. The Proxy will use the provided context values and evaluate the toggles provided in the `toggle` property. It returns the toggles that evaluate to false. As such, the list it returns is always a subset of the toggles you provide it.',
                summary:
                    'Which of the provided toggles are enabled given the provided context?',
                tags: ['Proxy client'],
            }),
            this.lookupToggles.bind(this),
        );

        router.get(
            '/client/features',
            openApiService.validPath({
                responses: {
                    ...standardResponses(401, 503),
                    200: apiRequestResponse,
                },
                description:
                    "Returns the toggle configuration from the proxy's internal Unleash SDK. Use this to bootstrap other proxies and server-side SDKs. Requires you to provide one of the proxy's configured `serverSideTokens` for authorization.",
                summary:
                    "Retrieve the proxy's current toggle configuration (as consumed by the internal client).",
                tags: ['Server-side client'],
            }),
            this.unleashApi.bind(this),
        );

        router.post(
            '/client/metrics',
            openApiService.validPath({
                requestBody: registerMetricsRequest,
                responses: standardResponses(200, 400, 401),
                description:
                    "This endpoint lets you register usage metrics with Unleash. Accepts either one of the proxy's configured `serverSideTokens` or one of its `clientKeys` for authorization.",
                summary: 'Send usage metrics to Unleash.',
                tags: ['Operational', 'Server-side client'],
            }),
            this.registerMetrics.bind(this),
        );

        router.post(
            '/client/register',
            openApiService.validPath({
                requestBody: registerClientRequest,
                responses: standardResponses(200, 400, 401),
                description:
                    "This endpoint lets you register application with Unleash. Accepts either one of the proxy's configured `serverSideTokens` or one of its `clientKeys` for authorization.",
                summary: 'Register clients with Unleash.',
                tags: ['Operational', 'Server-side client'],
            }),
            this.registerClient.bind(this),
        );

        router.get(
            '/health',
            openApiService.validPath({
                security: [],
                responses: {
                    ...standardResponses(200, 503),
                },
                description:
                    'Returns a 200 OK if the proxy is ready to receive requests. Otherwise returns a 503 NOT READY.',
                summary:
                    'Check whether the proxy is ready to serve requests yet.',
                tags: ['Operational'],
            }),
            this.health.bind(this),
        );

        router.get(
            '/internal-backstage/prometheus',
            openApiService.validPath({
                security: [],
                responses: {
                    ...standardResponses(503),
                    200: prometheusRequestResponse,
                },
                description:
                    'Returns a 200 and valid Prometheus text syntax if the proxy is ready to receive requests. Otherwise returns a 503 NOT READY.',
                summary: 'Check whether the proxy is up and running',
                tags: ['Operational'],
            }),
            this.prometheus.bind(this),
        );
    }

    private setReady() {
        this.ready = true;
        this.logger.info(
            'Successfully synchronized with Unleash API. Proxy is now ready to receive traffic.',
        );
    }

    // kept for backward compatibility
    setProxySecrets(clientKeys: string[]): void {
        this.setClientKeys(clientKeys);
    }

    setClientKeys(clientKeys: string[]): void {
        this.clientKeys = clientKeys;
    }

    getAllToggles(req: Request, res: Response<FeaturesSchema | string>): void {
        const apiToken = req.header(this.clientKeysHeaderName);

        if (!this.enableAllEndpoint) {
            res.status(501).send(
                'The /proxy/all endpoint is disabled. Please check your server configuration. To enable it, set the `enableAllEndpoint` configuration option or `ENABLE_ALL_ENDPOINT` environment variable to `true`.',
            );
        } else if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else if (!apiToken || !this.clientKeys.includes(apiToken)) {
            res.sendStatus(401);
        } else {
            const { query } = req;
            query.remoteAddress = query.remoteAddress || req.ip;
            const context = createContext(query);
            const toggles = this.client.getAllToggles(context);
            res.set('Cache-control', 'public, max-age=2');
            res.send({ toggles });
        }
    }

    getEnabledToggles(
        req: Request,
        res: Response<FeaturesSchema | string>,
    ): void {
        const apiToken = req.header(this.clientKeysHeaderName);

        if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else if (!apiToken || !this.clientKeys.includes(apiToken)) {
            res.sendStatus(401);
        } else {
            const { query } = req;
            query.remoteAddress = query.remoteAddress || req.ip;
            enrichContext(this.contextEnrichers, createContext(query)).then(
                (context) => {
                    const toggles = this.client.getEnabledToggles(context);
                    res.set('Cache-control', 'public, max-age=2');
                    res.send({ toggles });
                },
            );
        }
    }

    lookupToggles(
        req: Request<any, any, LookupTogglesSchema>,
        res: Response<FeaturesSchema | string>,
    ): void {
        const clientToken = req.header(this.clientKeysHeaderName);

        if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else if (!clientToken || !this.clientKeys.includes(clientToken)) {
            res.sendStatus(401);
        } else {
            const { context = {}, toggles: toggleNames = [] } = req.body;

            const toggles = this.client.getDefinedToggles(
                toggleNames,
                context as Context,
            );

            res.send({ toggles });
        }
    }

    health(_: Request, res: Response<string>): void {
        if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else {
            res.send('ok');
        }
    }

    prometheus(_: Request, res: Response<string>): void {
        if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else {
            const prometheusResponse =
                '# HELP unleash_proxy_up Indication that the service is up. \n' +
                '# TYPE unleash_proxy_up counter\n' +
                'unleash_proxy_up 1\n';
            res.set('Content-type', 'text/plain');
            res.send(prometheusResponse);
        }
    }

    registerMetrics(
        req: Request<{}, undefined, RegisterMetricsSchema>,
        res: Response<string>,
    ): void {
        const token = req.header(this.clientKeysHeaderName);
        const validTokens = [...this.clientKeys, ...this.serverSideTokens];

        if (token && validTokens.includes(token)) {
            this.client.registerMetrics(req.body);
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    }

    registerClient(
        req: Request<{}, undefined, RegisterClientSchema>,
        res: Response<string>,
    ): void {
        const token = req.header(this.clientKeysHeaderName);
        const validTokens = [...this.clientKeys, ...this.serverSideTokens];

        if (token && validTokens.includes(token)) {
            this.logger.debug('Client registration is not supported yet.');
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    }

    unleashApi(req: Request, res: Response<string | ApiRequestSchema>): void {
        const apiToken = req.header(this.clientKeysHeaderName);
        if (!this.ready) {
            res.status(503).send(NOT_READY_MSG);
        } else if (apiToken && this.serverSideTokens.includes(apiToken)) {
            const features = this.client.getFeatureToggleDefinitions();
            res.set('Cache-control', 'public, max-age=2');
            res.send({ version: 2, features });
        } else {
            res.sendStatus(401);
        }
    }
}
