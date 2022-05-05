import { OpenAPIV3 } from 'openapi-types';

type ParameterName = string;
type Description = string;

export const createRequestParameters = (
    params: Record<ParameterName, Description>,
): OpenAPIV3.ParameterObject[] =>
    Object.entries(params).map(([name, description]) => ({
        name,
        description,
        schema: { type: 'string' },
        in: 'query',
    }));

export const createDeepObjectRequestParameters = (
    params: Record<
        ParameterName,
        { description: string; example: Record<string, string> }
    >,
): OpenAPIV3.ParameterObject[] =>
    Object.entries(params).map(([name, { description, example }]) => ({
        in: 'query',
        schema: {
            type: 'object',
            additionalProperties: { type: 'string' },
        },
        style: 'form',
        explode: true,
        name,
        description,
        example,
    }));
