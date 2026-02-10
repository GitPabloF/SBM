import { z } from "zod";

const sanitizeString = (value: string) =>
  value
    .trim()
    // very simple sanitization to avoid obvious XSS payloads
    .replace(/</g, "")
    .replace(/>/g, "");

export const createBookmarkSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Invalid URL")
    .refine(
      (v) => v.startsWith("http://") || v.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  title: z
    .string()
    .optional()
    .transform((value) => value?.trim().replace(/</g, "").replace(/>/g, "")),
  coverUrl: z
    .string()
    .trim()
    .url("Invalid cover URL")
    .optional(),
  tags: z
    .array(
      z
        .string()
        .transform(sanitizeString)
    )
    .optional()
    .default([]),
});