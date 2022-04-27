import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['appName', 'instanceId', 'environment', 'bucket'],
    properties: {
        appName: { type: 'string' },
        instanceId: { type: 'string' },
        environment: { type: 'string' },
        bucket: {
            type: 'object',
            required: ['start', 'stop', 'toggles'],
            properties: {
                start: { type: 'string', format: 'date-time' },
                stop: { type: 'string', format: 'date-time' },
                toggles: {
                    type: 'object',
                    properties: {
                        yes: { type: 'integer', minimum: 0 },
                        no: { type: 'integer', minimum: 0 },
                        variants: {
                            type: 'object',
                            additionalProperties: {
                                type: 'integer',
                                minimum: 0,
                            },
                        },
                    },
                },
            },
        },
    },
} as const;

export type MetricsSchema = CreateSchemaType<typeof schema>;

export const metricsSchema = createSchemaObject(schema);
