import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stores = await prisma.store.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        storeId: true,
        storeName: true
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({ success: true, data: stores })
  } catch (err: unknown) {
    console.error("[GET /api/stores/my]", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Terjadi kesalahan"
      },
      { status: 500 }
    )
  }
}
