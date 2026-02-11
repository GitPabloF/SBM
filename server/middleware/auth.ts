import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/server/utils/jwt.utile"
import { JWTPayload } from "@/server/utils/jwt.utile"
import { getCookieValue } from "@/server/utils/cookies"

/**
 * Authenticate a request by verifying the access token from either cookies or a Bearer token.
 * @param request - The incoming request
 * @returns An object indicating success or failure, and either the user payload or an error response
 */
export function auth(
  request: Request,
):
  | { success: true; user: JWTPayload }
  | { success: false; response: NextResponse } {
  const cookieToken = getCookieValue(request, "accessToken")
  let token = cookieToken

  if (!token) {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Missing authorization header" },
          { status: 401 },
        ),
      }
    }

    token = authHeader.split(" ")[1]
  }

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 401 },
      ),
    }
  }

  try {
    const user = verifyAccessToken(token)
    return { success: true, user }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage === "INVALID_ACCESS_TOKEN") {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Invalid access token" },
          { status: 401 },
        ),
      }
    }
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Authentication error" },
        { status: 500 },
      ),
    }
  }
}
