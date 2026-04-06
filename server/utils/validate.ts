import type { ZodType } from 'zod'

/**
 * Wrap a Zod schema into a validator function suitable for H3's
 * `readValidatedBody` / `getValidatedRouterParams` / `getValidatedQuery`.
 *
 * On failure, throws an H3 400 error whose message is derived from the
 * first Zod issue (field path + message). On success, returns the
 * parsed (and coerced/defaulted) output.
 */
export function zodValidator<T>(schema: ZodType<T>) {
  return (data: unknown): T => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const first = result.error.issues[0]
      const path = first?.path && first.path.length > 0 ? `${first.path.join('.')}: ` : ''
      const message = `${path}${first?.message ?? 'Invalid input'}`
      throw createError({ statusCode: 400, statusMessage: message })
    }
    return result.data
  }
}
