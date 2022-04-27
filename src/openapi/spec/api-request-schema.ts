import { Operator } from 'unleash-client/lib/strategy/strategy';
import { createSchemaObject, CreateSchemaType } from '../openapi-types';

const schema = {
    type: 'object',
    required: ['features', 'version'],
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
                                        properties: {
                                            contextName: {
                                                type: 'string',
                                            },
                                            operator: {
                                                type: 'string',
                                                enum: Object.values(Operator),
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
                            },
                        },
                    },
                    variants: {
                        items: {
                            type: 'object',
                            required: ['name', 'weight', 'overrides'],
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
                                    required: ['type', 'value'],
                                    properties: {
                                        type: {
                                            type: 'string',
                                            enum: ['string'],
                                        },
                                        value: 'string',
                                    },
                                },
                                overrides: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['contextName', 'values'],
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
                        type: 'array',
                    },
                },
            },
        },
    },
} as const;

export type ApiRequestSchema = CreateSchemaType<typeof schema>;

export const apiRequestSchema = createSchemaObject(schema);
