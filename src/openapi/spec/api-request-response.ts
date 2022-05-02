import { OpenAPIV3 } from 'openapi-types';
import { CreateSchemaType } from '../openapi-types';
import { apiRequestSchema } from './api-request-schema';

export const apiRequestResponse: OpenAPIV3.ResponseObject = {
    description: 'The list of enabled toggles for the provided context.',
    content: {
        'application/json': {
            schema: apiRequestSchema,
        },
    },
} as const;

export type ApiRequestResponseSchema = CreateSchemaType<
    typeof apiRequestResponse
>;
