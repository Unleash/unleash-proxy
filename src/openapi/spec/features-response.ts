import { OpenAPIV3 } from 'openapi-types';
import { CreateSchemaType } from '../openapi-types';

export const featuresResponse: OpenAPIV3.ResponseObject = {
    description: 'The list of enabled toggles for the provided context.',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featuresSchema',
            },
        },
    },
} as const;

export type FeaturesResponseSchema = CreateSchemaType<typeof featuresResponse>;
