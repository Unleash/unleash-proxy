import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    properties: {
        appName: { type: 'string' },
        environment: { type: 'string' },
        userId: { type: 'string' },
        sessionId: { type: 'string' },
        remoteAddress: { type: 'string' },
        properties: {
            type: 'object',
            additionalProperties: {
                type: 'string',
            },
            example: {
                region: 'Africa',
                betaTester: 'true',
            },
        },
    },
} as const;

export type UnleashContextSchema = CreateSchemaType<typeof schema>;

export const unleashContextSchema = createSchemaObject(schema);
