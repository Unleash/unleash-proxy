import type { FromSchema, JSONSchema } from 'json-schema-to-ts';

// Recursively remove readonly modifiers from properties.
type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};

// Create a type from a const schema object.
export type CreateSchemaType<T extends JSONSchema> = FromSchema<T>;

// Create an OpenAPIV3.SchemaObject from a const schema object.
export const createSchemaObject = <T>(schema: T): DeepMutable<T> => schema;
