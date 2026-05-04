import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "../../../lib/auth"
import { prisma } from "../../../lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const store = await prisma.store.findFirst({
      where: { userId: user.userId }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ store })
  } catch (err: unknown) {
    console.error("[GET /api/stores/my]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
