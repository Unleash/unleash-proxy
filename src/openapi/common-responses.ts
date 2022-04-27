import { OpenAPIV3 } from 'openapi-types';

const NOT_READY_MSG =
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

export const badRequestResponse: OpenAPIV3.ResponseObject = {
    description: 'Bad request. You provided data that is missing or invalid.',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/errorSchema',
            },
        },
    },
};

const commonResponses: Record<string, OpenAPIV3.ResponseObject> = {
    200: emptySuccessResponse,
    400: badRequestResponse,
    401: unauthorizedResponse,
    503: notReadyResponse,
} as const;

/** Merge all response objects provided with the default/common responses
   provided. Response collections later in the chain will override response
   collections from earlier in the case of collisions. The common respones can
   also be overridden.
 */
export const withStandardResponses =
    (...statusCodes: number[]) =>
    (...responses: Record<number, OpenAPIV3.ResponseObject>[]) => {
        const baseResponses = statusCodes
            .filter((n) => n in commonResponses)
            .reduce(
                (acc, n) => ({
                    ...acc,
                    [n]: commonResponses[String(n)] as OpenAPIV3.ResponseObject,
                }),
                {},
            );

        return responses.reduce(
            (current, next) => ({ ...current, ...next }),
            baseResponses,
        );
    };
