import type { OpenAPIV3 } from 'openapi-types';
import { apiRequestSchema } from './spec/api-request-schema';
import { featureSchema } from './spec/feature-schema';
import { featuresSchema } from './spec/features-schema';
import { lookupTogglesSchema } from './spec/lookup-toggles-schema';
import { registerMetricsSchema } from './spec/register-metrics-schema';
import { registerClientSchema } from './spec/register-client-schema';
import { unleashContextSchema } from './spec/unleash-context-schema';
import { variantSchema } from './spec/variant-schema';

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
    tags: [
        {
            name: 'Proxy client',
            description:
                'Feature toggle endpoints intended to be consumed by proxy clients.',
        },
        {
            name: 'Server-side client',
            description:
                'Feature toggle endpoints related to and intended to be consumed by server-side clients and other proxies.',
        },
        {
            name: 'Operational',
            description: 'Endpoints related to operating the Unleash proxy.',
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
        schemas: {
            apiRequestSchema,
            featureSchema,
            featuresSchema,
            lookupTogglesSchema,
            registerMetricsSchema,
            registerClientSchema,
            unleashContextSchema,
            variantSchema,
        },
    },
});
