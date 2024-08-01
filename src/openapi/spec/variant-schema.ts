import { type CreateSchemaType, createSchemaObject } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['name', 'enabled'],
    additionalProperties: false,
    properties: {
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        feature_enabled: {
            type: 'boolean',
        },
        featureEnabled: {
            type: 'boolean',
        },
        payload: {
            type: 'object',
            additionalProperties: false,
            required: ['type', 'value'],
            properties: {
                type: {
                    type: 'string',
                    enum: ['string', 'json', 'csv', 'number'],
                },
                value: { type: 'string' },
            },
        },
    },
} as const;

export type VariantSchema = CreateSchemaType<typeof schema>;

export const variantSchema = createSchemaObject(schema);
