import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['name', 'enabled'],
    properties: {
        name: {
            type: 'string',
        },
        enabled: {
            type: 'boolean',
        },
        payload: {
            type: 'object',
        },
    },
} as const;

export type VariantSchema = CreateSchemaType<typeof schema>;

export const variantSchema = createSchemaObject(schema);
