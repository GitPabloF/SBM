import { connectDatabase } from "@/server/config/database"
import { auth } from "@/server/middleware/auth"
import { checkRateLimit } from "@/server/middleware/apiLimitre"
import { NextRequest, NextResponse } from "next/server"
import bookmarkService from "@/server/services/bookmark.service"

type Params = { params: Promise<{ bookmarkId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Limit to 30 requests per 15 minutes to prevent abuse
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const { bookmarkId } = await params

    await connectDatabase()

    const bookmark = await bookmarkService.getBookmarkByID(
      authentication.user.id,
      bookmarkId,
    )

    return NextResponse.json({
      success: true,
      message: "Bookmark fetched successfully",
      data: bookmark,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "NO_USER_ID_OR_BOOKMARK_ID") {
      return NextResponse.json(
        {
          success: false,
          error: "You should provide a user ID and bookmark ID",
        },
        { status: 400 },
      )
    }
    if (message === "BOOKMARK_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Bookmark not found" },
        { status: 404 },
      )
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to fetch this bookmark",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const { bookmarkId } = await params
    const body = await request.json()
    const { title, coverUrl, tags } = body

    await connectDatabase()

    const bookmark = await bookmarkService.updateBookmark(
      authentication.user.id,
      bookmarkId,
      title,
      coverUrl,
      tags,
    )

    return NextResponse.json({
      success: true,
      message: "Bookmark updated successfully",
      data: bookmark,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "NO_USER_ID_OR_BOOKMARK_ID") {
      return NextResponse.json(
        {
          success: false,
          error: "You should provide a user ID and bookmark ID",
        },
        { status: 400 },
      )
    }
    if (message === "BOOKMARK_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Bookmark not found" },
        { status: 404 },
      )
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to update this bookmark",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const limited = await checkRateLimit(request)
    if (limited) return limited

    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const { bookmarkId } = await params

    await connectDatabase()

    await bookmarkService.deleteBookmark(authentication.user.id, bookmarkId)

    return NextResponse.json({
      success: true,
      message: "Bookmark deleted successfully",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "NO_USER_ID_OR_BOOKMARK_ID") {
      return NextResponse.json(
        {
          success: false,
          error: "You should provide a user ID and bookmark ID",
        },
        { status: 400 },
      )
    }
    if (message === "BOOKMARK_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Bookmark not found" },
        { status: 404 },
      )
    }
    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to delete this bookmark",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
