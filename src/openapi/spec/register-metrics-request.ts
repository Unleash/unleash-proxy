import type { OpenAPIV3 } from 'openapi-types';

export const registerMetricsRequest: OpenAPIV3.RequestBodyObject = {
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/registerMetricsSchema',
            },
        },
    },
};
