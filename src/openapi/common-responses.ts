import { OpenAPIV3 } from 'openapi-types';

export const NOT_READY_MSG =
    'The Unleash Proxy has not connected to the Unleash API and is not ready to accept requests yet.';

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

const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
    200: emptySuccessResponse,
    401: unauthorizedResponse,
    503: notReadyResponse,
} as const;

export const standardResponses = (
    ...statusCodes: number[]
): OpenAPIV3.ResponsesObject =>
    statusCodes
        .filter((n) => n in commonResponses)
        .reduce(
            (acc, n) => ({
                ...acc,
                [n]: commonResponses[String(n)] as OpenAPIV3.ResponseObject,
            }),
            {},
        );
