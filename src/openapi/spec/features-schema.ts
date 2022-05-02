import { createSchemaObject, CreateSchemaType } from '../openapi-types';
import { featureSchema } from './feature-schema';

export const schema = {
    type: 'object',
    required: ['toggles'],
    additionalProperties: false,
    properties: {
        toggles: {
            type: 'array',
            items: featureSchema,
        },
    },
} as const;

export type FeaturesSchema = CreateSchemaType<typeof schema>;

export const featuresSchema = createSchemaObject(schema);
