import { OpenAPIV3 } from 'openapi-types';

export const prometheusRequestResponse: OpenAPIV3.ResponseObject = {
    description: 'The request was successful. Response in plain text format conforming to Prometheus exposition format',
    content: {
        'text/plain': {
            schema: {
                type: 'string',
                example: 'metric_name 1',
            },
        },
    },
} as const;
