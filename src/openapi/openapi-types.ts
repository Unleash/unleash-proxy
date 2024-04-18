import type { FromSchema } from 'json-schema-to-ts';
import type { JSONSchema7 } from 'json-schema-to-ts/lib/types/definitions';

// Recursively remove readonly modifiers from properties.
type DeepMutable<T> = {
    -readonly [P in keyof T]: DeepMutable<T[P]>;
};

// Create a type from a const schema object.
export type CreateSchemaType<T extends JSONSchema7> = FromSchema<T>;

// Create an OpenAPIV3.SchemaObject from a const schema object.
export const createSchemaObject = <T>(schema: T): DeepMutable<T> => schema;
