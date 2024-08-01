import type { OpenAPIV3 } from 'openapi-types';

export const apiRequestResponse: OpenAPIV3.ResponseObject = {
    description:
        "The proxy's current feature toggle configuration. A list of feature toggles that is parseable by other server-side clients.",
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/apiRequestSchema',
            },
        },
    },
} as const;
