import { type CreateSchemaType, createSchemaObject } from '../openapi-types';
import { unleashContextSchema } from './unleash-context-schema';

export const schema = {
    type: 'object',
    properties: {
        context: unleashContextSchema,
        toggles: {
            type: 'array',
            example: ['myToggle', 'yourToggle'],
            items: {
                type: 'string',
            },
        },
    },
} as const;

export type LookupTogglesSchema = CreateSchemaType<typeof schema>;

export const lookupTogglesSchema = createSchemaObject(schema);
