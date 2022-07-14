import { RequestHandler, Application } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import openapi, { IExpressOpenApi } from '@unleash/express-openapi';
import { IProxyConfig } from '../config';
import { createOpenApiSchema } from '.';

export class OpenApiService {
    private readonly config: IProxyConfig;

    private readonly api: IExpressOpenApi;

    constructor(config: IProxyConfig) {
        this.config = config;
        this.api = openapi(
            this.docsPath(),
            createOpenApiSchema(
                config.proxyBasePath,
                config.clientKeysHeaderName,
            ),
            { coerce: true },
        );
    }

    docsPath(): string {
        return `${this.config.proxyBasePath}/docs/openapi`;
    }

    // Serve the OpenAPI JSON at `${this.docsPath()}.json`,
    // and the OpenAPI SwaggerUI at `${this.docsPathPath}`.
    useDocs(app: Application): void {
        app.use(this.api);
        app.use(this.docsPath(), this.api.swaggerui);
    }

    // Create request validation middleware
    validPath(op: OpenAPIV3.OperationObject): RequestHandler {
        return this.api.validPath(op);
    }

    // Catch and format Open API validation errors.
    useErrorHandler(app: Application): void {
        app.use((err: any, _: any, res: any, next: any) => {
            if (err && err.status && err.validationErrors) {
                res.status(err.statusCode).json({
                    error: err.message,
                    validation: err.validationErrors,
                });
            } else if (err instanceof SyntaxError) {
                res.status(400).json({
                    error: `We were unable to parse the data you provided. Please check it for syntax errors. The message we got was: "${err.message}"`,
                });
            } else if (err) {
                res.status(500).json({
                    error: `Whoops! We dropped the ball on this one (an unexpected error occurred): ${err.message}`,
                });
            }
            {
                next();
            }
        });
    }
}
