import type { OpenAPIV3 } from 'openapi-types';

export const registerClientRequest: OpenAPIV3.RequestBodyObject = {
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/registerClientSchema',
            },
        },
    },
};
