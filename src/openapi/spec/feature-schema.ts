import { type CreateSchemaType, createSchemaObject } from '../openapi-types';
import { variantSchema } from './variant-schema';

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
        impressionData: {
            type: 'boolean',
        },
        variant: variantSchema,
    },
} as const;

export type FeatureSchema = CreateSchemaType<typeof schema>;

export const featureSchema = createSchemaObject(schema);
