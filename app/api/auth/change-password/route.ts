import { auth } from "@/server/middleware/auth"
import authService from "@/server/services/auth.service"
import { connectDatabase } from "@/server/config/database"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const authentication = auth(request)
    if (!authentication.success) return authentication.response

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Current password and new password are required",
        },
        { status: 400 },
      )
    }

    await connectDatabase()

    await authService.changePassword(
      authentication.user.id,
      currentPassword,
      newPassword,
    )

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      )
    }
    if (message === "CURRENT_PASSWORD_INCORRECT") {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
