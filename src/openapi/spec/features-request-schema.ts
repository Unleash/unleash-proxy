import { createSchemaObject, CreateSchemaType } from '../openapi-types';

export const schema = {
    type: 'object',
    properties: {
        context: {
            $ref: '#/components/schemas/unleashContextSchema',
        },
        toggleNames: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
} as const;

export type FeaturePayloadSchema = CreateSchemaType<typeof schema>;

export const featurePayloadSchema = createSchemaObject(schema);
