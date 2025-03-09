import * as z from "zod";

/**
 * Converts a JSON Schema object to a Zod schema
 * 
 * Note: This is a simplified implementation that supports the most common
 * JSON Schema types and features needed for Stagehand's data extraction.
 * It doesn't implement all JSON Schema features.
 */
export function jsonSchemaToZod(schema: any): z.ZodTypeAny {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema");
  }

  // Handle root schema
  return convertSchema(schema);
}

function convertSchema(schema: any): z.ZodTypeAny {
  // Handle type-specific conversion
  switch (schema.type) {
    case "string":
      let stringSchema = z.string();
      
      if (schema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }
      
      if (schema.minLength !== undefined) {
        stringSchema = stringSchema.min(schema.minLength);
      }
      
      if (schema.maxLength !== undefined) {
        stringSchema = stringSchema.max(schema.maxLength);
      }
      
      return stringSchema;
      
    case "number":
    case "integer":
      let numberSchema = schema.type === "integer" ? z.number().int() : z.number();
      
      if (schema.minimum !== undefined) {
        numberSchema = numberSchema.min(schema.minimum);
      }
      
      if (schema.maximum !== undefined) {
        numberSchema = numberSchema.max(schema.maximum);
      }
      
      return numberSchema;
      
    case "boolean":
      return z.boolean();
      
    case "null":
      return z.null();
      
    case "array":
      if (!schema.items) {
        return z.array(z.any());
      }
      
      const itemSchema = convertSchema(schema.items);
      let arraySchema = z.array(itemSchema);
      
      if (schema.minItems !== undefined) {
        arraySchema = arraySchema.min(schema.minItems);
      }
      
      if (schema.maxItems !== undefined) {
        arraySchema = arraySchema.max(schema.maxItems);
      }
      
      return arraySchema;
      
    case "object":
      const propertySchemas: Record<string, z.ZodTypeAny> = {};
      
      if (schema.properties) {
        for (const key in schema.properties) {
          propertySchemas[key] = convertSchema(schema.properties[key]);
        }
      }
      
      let objectSchema = z.object(propertySchemas);
      
      // Handle required properties
      if (Array.isArray(schema.required) && schema.required.length > 0) {
        const requiredKeys = new Set(schema.required);
        const shapeKeys = Object.keys(propertySchemas);
        
        // Make non-required properties optional
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const key of shapeKeys) {
          shape[key] = requiredKeys.has(key) 
            ? propertySchemas[key] 
            : propertySchemas[key].optional();
        }
        
        objectSchema = z.object(shape);
      } else {
        // If no required array is specified, make all properties optional
        objectSchema = objectSchema.partial();
      }
      
      // Note: Additional properties handling is simplified in this implementation
      // If you need strict handling of additional properties, you may need to customize this
      
      return objectSchema;
      
    default:
      // If no type is specified or it's not a standard type, return any
      return z.any();
  }
}