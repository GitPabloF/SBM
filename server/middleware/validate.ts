import { ZodSchema } from "zod"
import { NextResponse } from "next/server"

/**
 * Validate request data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns An object indicating success or failure, and either the validated data or an error response
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: result.error.flatten(),
        },
        { status: 400 },
      ),
    }
  }

  return { success: true, data: result.data }
}
