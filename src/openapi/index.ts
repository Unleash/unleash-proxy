import { OpenAPIV3 } from 'openapi-types';
import { featuresSchema } from './spec/features-schema';
import { featureSchema } from './spec/feature-schema';
import { variantSchema } from './spec/variant-schema';
import { errorSchema } from './spec/error-schema';
import { featurePayloadSchema } from './spec/features-request-schema';
import { unleashContextSchema } from './spec/unleash-context-schema';
import { metricsSchema } from './spec/metrics-schema';

// Create the base OpenAPI schema, with everything except paths.
export const createOpenApiSchema = (
    serverUrl?: string,
): Omit<OpenAPIV3.Document, 'paths'> => {
    return {
        openapi: '3.0.3',
        servers: serverUrl ? [{ url: serverUrl }] : [],
        info: {
            title: 'Unleash API',
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
                    name: 'Authorization',
                },
            },
            schemas: {
                featuresSchema,
                featureSchema,
                variantSchema,
                errorSchema,
                featurePayloadSchema,
                unleashContextSchema,
                metricsSchema,
            },
        },
    };
};
