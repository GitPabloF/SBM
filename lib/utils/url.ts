const HTTP_PROTOCOL_REGEX = /^https?:\/\//i
const MISSING_H_PREFIX_REGEX = /^ttps:\/\//i

export const isHttpUrl = (value: string): boolean =>
  HTTP_PROTOCOL_REGEX.test(value)

export const normalizeIncomingUrl = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ""

  let decoded = trimmed
  if (trimmed.includes("%")) {
    try {
      decoded = decodeURIComponent(trimmed)
    } catch {
      decoded = trimmed
    }
  }

  if (MISSING_H_PREFIX_REGEX.test(decoded)) return `h${decoded}`
  return decoded
}
