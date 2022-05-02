import { OpenAPIV3 } from 'openapi-types';
import { registerMetricsSchema } from './register-metrics-schema';

export const registerMetricsRequest: OpenAPIV3.RequestBodyObject = {
    content: {
        'application/json': {
            schema: registerMetricsSchema,
        },
    },
};
