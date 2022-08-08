import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['appName', 'interval', 'started', 'strategies'],
    properties: {
        appName: {
            type: 'string',
        },
        instanceId: {
            type: 'string',
        },
        sdkVersion: {
            type: 'string',
        },
        environment: {
            type: 'string',
        },
        interval: {
            type: 'number',
        },
        started: {
            oneOf: [
                { type: 'string', format: 'date-time' },
                { type: 'number' },
            ],
        },
        strategies: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
} as const;

export type RegisterClientSchema = CreateSchemaType<typeof schema>;

export const registerClientSchema = createSchemaObject(schema);
