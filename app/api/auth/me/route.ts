import { auth } from "@/server/middleware/auth"
import authService from "@/server/services/auth.service"
import { connectDatabase } from "@/server/config/database"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    await connectDatabase()

    const user = await authService.getUserById(authentication.user.id)

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const body = await request.json()
    const { name, email } = body

    await connectDatabase()

    await authService.updateUser(authentication.user.id, name, email)

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      )
    }
    if (message === "NAME_OR_EMAIL_ARE_REQUIRED") {
      return NextResponse.json(
        { success: false, error: "Name or email are required" },
        { status: 400 },
      )
    }
    if (message === "NO_USER_ID") {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    await connectDatabase()

    await authService.deleteUser(authentication.user.id)

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
