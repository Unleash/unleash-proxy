import { OpenAPIV3 } from 'openapi-types';

const NOT_READY_MSG =
    'The Unleash Proxy has not connected to Unleash API and is not ready to accept requests yet.';

export const notReadyResponse: OpenAPIV3.ResponseObject = {
    description: "The proxy isn't ready to accept requests yet.",
    content: {
        'text/plain': {
            schema: {
                type: 'string',
                example: NOT_READY_MSG,
            },
        },
    },
} as const;

export const unauthorizedResponse: OpenAPIV3.ResponseObject = {
    description: 'Authorization information is missing or invalid.',
} as const;

export const emptySuccessResponse: OpenAPIV3.ResponseObject = {
    description: 'The request was successful.',
    content: {
        'text/plain': {
            schema: {
                type: 'string',
                example: 'ok',
            },
        },
    },
} as const;

/**
   Merge all response objects provided with the default responses that apply for
   all endpoints. Response collections later in the chain will override response
   collections from earlier in the case of collisions. The common respones can
   also be overridden.
 */
export const withCommonResponses = (
    ...responses: Record<number, OpenAPIV3.ResponseObject>[]
) => {
    return responses.reduce((current, next) => ({ ...current, ...next }), {
        503: notReadyResponse,
        401: unauthorizedResponse,
    });
};
