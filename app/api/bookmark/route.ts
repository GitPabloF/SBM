import { connectDatabase } from "@/server/config/database"
import { auth } from "@/server/middleware/auth"
import { validate } from "@/server/middleware/validate"
import { createBookmarkSchema } from "@/server/validation/bookmark.schemas"
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextRequest, NextResponse } from "next/server"
import bookmarkService from "@/server/services/bookmark.service"

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export async function GET(request: NextRequest) {
  try {
    // Limit to 30 requests per 15 minutes to prevent abuse
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    await connectDatabase()

    const userId = authentication.user.id
    const searchParams = request.nextUrl.searchParams

    const tagsParam = searchParams.getAll("tags")
    const titleParam = searchParams.get("title")

    let filteredTag: string[] | undefined

    if (tagsParam.length > 0) {
      // Handle both ?tags=js&tags=react and ?tags=js,react
      filteredTag = tagsParam
        .flatMap((tag) => tag.split(","))
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    }

    const searchTitle = titleParam ? titleParam.trim() : undefined

    const bookmarks = await bookmarkService.getBookmarks(
      userId,
      filteredTag,
      searchTitle,
    )

    return NextResponse.json({
      success: true,
      message: "Fetched successfully",
      data: bookmarks,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `An error has occurred: ${error}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const body = await request.json()
    const validation = validate(createBookmarkSchema, body)
    if (!validation.success) return validation.response

    const { url, tags } = validation.data

    await connectDatabase()

    const bookmark = await bookmarkService.createBookmark(
      authentication.user.id,
      url,
      tags,
    )

    return NextResponse.json(
      {
        success: true,
        message: "Bookmark created successfully",
        data: bookmark,
      },
      { status: 201 },
    )
  } catch (error) {
    const message = toErrorMessage(error)

    if (message === "NO_USER_ID_OR_URL") {
      return NextResponse.json(
        { success: false, error: "You should provide a user ID and URL" },
        { status: 400 },
      )
    }

    const errorId = crypto.randomUUID()
    console.error("[api/bookmark][POST]", {
      errorId,
      message,
      error,
    })

    return NextResponse.json(
      { success: false, error: "Internal server error", errorId },
      { status: 500 },
    )
  }
}
