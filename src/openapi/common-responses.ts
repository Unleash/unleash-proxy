import { OpenAPIV3 } from 'openapi-types';

export const NOT_READY_MSG =
    'The Unleash Proxy has not connected to the Unleash API and is not ready to accept requests yet.';

export const notReadyResponse = {
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

export const unauthorizedResponse = {
    description: 'Authorization information is missing or invalid.',
} as const;

export const emptySuccessResponse = {
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

const commonResponses = {
    200: emptySuccessResponse,
    401: unauthorizedResponse,
    503: notReadyResponse,
} as const;

type CommonResponses = typeof commonResponses;

export const standardResponses = (
    ...statusCodes: (keyof CommonResponses)[]
): Partial<CommonResponses> =>
    statusCodes.reduce(
        (acc, n) => ({
            ...acc,
            [n]: commonResponses[n],
        }),
        {} as Partial<CommonResponses>,
    );
