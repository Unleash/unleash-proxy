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
