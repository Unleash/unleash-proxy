import { OpenAPIV3 } from 'openapi-types';

export const lookupTogglesRequest: OpenAPIV3.RequestBodyObject = {
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/metricsSchema',
            },
        },
    },
};
