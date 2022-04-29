import { IProxyConfig } from '../config';
import { RequestHandler, Application } from 'express';
import { OpenAPIV3 } from 'openapi-types';
// @ts-expect-error
import openapi, { IExpressOpenApi } from '@unleash/express-openapi';
import { createOpenApiSchema } from './.';

export class OpenApiService {
    private readonly config: IProxyConfig;

    private readonly api: IExpressOpenApi;

    constructor(config: IProxyConfig) {
        this.config = config;
        this.api = openapi(
            this.docsPath(),
            createOpenApiSchema(config.proxyBasePath),
        );
    }

    // Serve the OpenAPI JSON at `${baseUriPath}/docs/openapi.json`,
    // and the OpenAPI SwaggerUI at `${baseUriPath}/docs/openapi`.
    docsPath(): string {
        const proxyBasePath = this.config.proxyBasePath;
        return `${proxyBasePath}/docs/openapi`;
    }

    // Serve the OpenAPI JSON at `${baseUriPath}/docs/openapi.json`,
    // and the OpenAPI SwaggerUI at `${baseUriPath}/docs/openapi`.
    useDocs(app: Application): void {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui);
    }

    // Create request validation middleware
    validPath(op: OpenAPIV3.OperationObject): RequestHandler {
        return this.api.validPath(op);
    }
}
