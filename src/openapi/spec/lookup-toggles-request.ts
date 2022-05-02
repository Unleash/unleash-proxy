import { OpenAPIV3 } from 'openapi-types';
import { lookupTogglesSchema } from './lookup-toggles-schema';

export const lookupTogglesRequest: OpenAPIV3.RequestBodyObject = {
    content: {
        'application/json': {
            schema: lookupTogglesSchema,
        },
    },
};
