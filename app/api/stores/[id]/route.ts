import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params // ← await params

    const store = await prisma.store.findFirst({
      where: { id, userId: user.userId }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      )
    }

    await prisma.store.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Toko berhasil dihapus"
    })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
