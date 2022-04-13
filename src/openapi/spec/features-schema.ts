import {createSchemaObject, CreateSchemaType } from '../openapi-types'

export const schema = {
  type: 'object',
  required: ['toggles'],
  properties: {
    toggles: {
      type: "array",
      items: {
        $ref: '#/components/schemas/featureSchema'
      }
    }
  }
} as const

export type FeaturesSchema = CreateSchemaType<typeof schema>

export const featuresSchema = createSchemaObject(schema)
