import type { OpenAPIV3 } from 'openapi-types';

export const format500ErrorMessage = (errorMessage: string): string =>
    `Whoops! We dropped the ball on this one (an unexpected error occurred): ${errorMessage}`;

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
};

export const unauthorizedResponse: OpenAPIV3.ResponseObject = {
    description: 'Authorization information is missing or invalid.',
};

export const badRequestResponse: OpenAPIV3.ResponseObject = {
    description: 'The provided request data is invalid.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: { type: 'string' },
                    validation: {
                        type: 'array',
                        items: { type: 'object' },
                    },
                },
                example: {
                    error: 'Request validation failed',
                    validation: [
                        {
                            keyword: 'required',
                            dataPath: '.body',
                            schemaPath:
                                '#/components/schemas/registerMetricsSchema/required',
                            params: {
                                missingProperty: 'appName',
                            },
                            message: "should have required property 'appName'",
                        },
                    ],
                },
            },
        },
    },
};

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
};

export const unsupportedMediaTypeResponse: OpenAPIV3.ResponseObject = {
    description:
        'The operation does not support request payloads of the provided type.',
    content: {
        'text/plain': {
            schema: {
                type: 'string',
                example: 'Unsupported media type',
            },
        },
    },
};

export const internalServerErrorResponse: OpenAPIV3.ResponseObject = {
    description:
        "Something went wrong on the server side and we were unable to recover. If you have custom strategies loaded, make sure they don't throw errors.",
    content: {
        'application/json': {
            schema: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: { type: 'string' },
                },
                example: {
                    error: format500ErrorMessage(
                        "Cannot read properties of undefined (reading 'includes')",
                    ),
                },
            },
        },
    },
};

export const notImplementedError: OpenAPIV3.ResponseObject = {
    description:
        'The functionality you are requesting is not implemented by the server. This could be due to a misconfiguration when starting the server.',
    content: {
        'application/json': {
            schema: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: {
                        type: 'string',
                        description:
                            'A description of the error that occurred.',
                    },
                },
                example: {
                    error: 'This functionality is not implemented by the server',
                },
            },
        },
    },
};

const commonResponses = {
    200: emptySuccessResponse,
    400: badRequestResponse,
    401: unauthorizedResponse,
    415: unsupportedMediaTypeResponse,
    500: internalServerErrorResponse,
    501: notImplementedError,
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
