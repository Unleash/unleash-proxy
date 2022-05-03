import { OpenAPIV3 } from 'openapi-types';
import { apiRequestSchema } from './spec/api-request-schema';
import { featureSchema } from './spec/feature-schema';
import { featuresSchema } from './spec/features-schema';
import { lookupTogglesSchema } from './spec/lookup-toggles-schema';
import { registerMetricsSchema } from './spec/register-metrics-schema';
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
            unleashContextSchema,
            variantSchema,
        },
    },
});
