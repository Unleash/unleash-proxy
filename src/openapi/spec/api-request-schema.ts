import { Operator } from 'unleash-client/lib/strategy/strategy';
import { createSchemaObject, CreateSchemaType } from '../openapi-types';

const schema = {
    type: 'object',
    required: ['toggles', 'version'],
    properties: {
        version: {
            type: 'integer',
            enum: [2],
        },
        toggles: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name'],
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
                            required: [
                                'id',
                                'name',
                                'constraints',
                                'parameters',
                            ],
                            properties: {
                                id: {
                                    type: 'string',
                                },
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
                            required: [
                                'name',
                                'weight',
                                'weightType',
                                'stickiness',
                                'overrides',
                            ],
                            properties: {
                                name: {
                                    type: 'string',
                                },
                                weight: {
                                    type: 'number',
                                },
                                weightType: {
                                    type: 'string',
                                },
                                stickiness: {
                                    type: 'string',
                                },
                                payload: {
                                    type: 'object',
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
