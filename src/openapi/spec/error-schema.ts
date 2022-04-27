import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    required: ['details'],
    additionalProperties: false,
    properties: {
        details: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
        },
    },
} as const;

export type ErrorSchema = CreateSchemaType<typeof schema>;

export const errorSchema = createSchemaObject(schema);
