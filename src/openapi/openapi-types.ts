import { RequestHandler } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import {FromSchema} from 'json-schema-to-ts'


// Recursively remove readonly modifiers from properties.
export type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};

// Partial types for "@wesleytodd/openapi".
export interface IExpressOpenApi extends RequestHandler {
    validPath: (operation: OpenAPIV3.OperationObject) => RequestHandler;
    schema: (name: string, schema: OpenAPIV3.SchemaObject) => void;
    swaggerui: RequestHandler;
}

// Create a type from a const schema object.
export type CreateSchemaType<T> = FromSchema<T>;

// Create an OpenAPIV3.SchemaObject from a const schema object.
export const createSchemaObject = <T>(schema: T): DeepMutable<T> => schema;
