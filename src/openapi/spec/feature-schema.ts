import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['name', 'enabled', 'variant'],
    properties: {
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        variant: {
            $ref: '#/components/schemas/variantSchema',
        },
    },
} as const;

export type FeatureSchema = CreateSchemaType<typeof schema>;

export const featureSchema = createSchemaObject(schema);
