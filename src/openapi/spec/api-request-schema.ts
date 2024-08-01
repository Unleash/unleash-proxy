import { Operator } from 'unleash-client/lib/strategy/strategy';
import { createSchemaObject, type CreateSchemaType } from '../openapi-types';

const schema = {
    type: 'object',
    required: ['features', 'version'],
    additionalProperties: false,
    properties: {
        version: {
            type: 'integer',
            enum: [2],
        },
        features: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name'],
                additionalProperties: false,
                properties: {
                    name: {
                        type: 'string',
                    },
                    description: {
                        type: 'string',
                    },
                    enabled: {
                        type: 'boolean',
                    },
                    stale: {
                        type: 'boolean',
                    },
                    impressionData: {
                        type: 'boolean',
                    },
                    strategies: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['name', 'constraints', 'parameters'],
                            additionalProperties: false,
                            properties: {
                                name: {
                                    type: 'string',
                                },
                                constraints: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['contextName', 'operator'],
                                        additionalProperties: false,
                                        properties: {
                                            contextName: {
                                                type: 'string',
                                            },
                                            operator: {
                                                type: 'string',
                                                description: `One of ${Object.values(
                                                    Operator,
                                                )}`,
                                            },
                                            values: {
                                                type: 'array',
                                                items: {
                                                    type: 'string',
                                                },
                                            },
                                        },
                                    },
                                },
                                parameters: {
                                    type: 'object',
                                },
                                variants: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['name', 'weight'],
                                        additionalProperties: false,
                                        properties: {
                                            name: {
                                                type: 'string',
                                            },
                                            weight: {
                                                type: 'number',
                                            },
                                            stickiness: {
                                                type: 'string',
                                            },
                                            payload: {
                                                type: 'object',
                                                additionalProperties: false,
                                                required: ['type', 'value'],
                                                properties: {
                                                    type: { type: 'string' },
                                                    value: { type: 'string' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    variants: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['name', 'weight'],
                            additionalProperties: false,
                            properties: {
                                name: {
                                    type: 'string',
                                },
                                weight: {
                                    type: 'number',
                                },
                                stickiness: {
                                    type: 'string',
                                },
                                payload: {
                                    type: 'object',
                                    additionalProperties: false,
                                    required: ['type', 'value'],
                                    properties: {
                                        type: { type: 'string' },
                                        value: { type: 'string' },
                                    },
                                },
                                overrides: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['contextName', 'values'],
                                        additionalProperties: false,
                                        properties: {
                                            contextName: {
                                                type: 'string',
                                            },
                                            values: {
                                                type: 'array',
                                                items: {
                                                    type: 'string',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;

export type ApiRequestSchema = CreateSchemaType<typeof schema>;

export const apiRequestSchema = createSchemaObject(schema);
