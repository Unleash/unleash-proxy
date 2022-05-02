import { OpenAPIV3 } from 'openapi-types';

// Create the base OpenAPI schema, with everything except paths.
export const createOpenApiSchema = (
    serverUrl?: string,
    clientKeysHeaderName: string = 'Authorization',
): Omit<OpenAPIV3.Document, 'paths'> => ({
    openapi: '3.0.3',
    servers: serverUrl ? [{ url: serverUrl }] : [],
    info: {
        title: 'Unleash Proxy API',
        version: process.env.npm_package_version || '',
    },
    security: [
        {
            apiKey: [],
        },
    ],
    components: {
        securitySchemes: {
            apiKey: {
                type: 'apiKey',
                in: 'header',
                name: clientKeysHeaderName,
            },
        },
    },
});
