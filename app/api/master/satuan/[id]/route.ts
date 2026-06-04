import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const data = await prisma.msSatuanBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!data)
      return NextResponse.json(
        { error: "Satuan tidak ditemukan" },
        { status: 404 }
      )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("GET satuan detail error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.msSatuanBarang.findFirst({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { error: "Satuan tidak ditemukan" },
        { status: 404 }
      )

    const updated = await prisma.msSatuanBarang.update({
      where: { id },
      data: {
        ...(body.deskripsiSatuan !== undefined && {
          deskripsiSatuan: body.deskripsiSatuan
        })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT satuan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const existing = await prisma.msSatuanBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!existing)
      return NextResponse.json(
        { error: "Satuan tidak ditemukan" },
        { status: 404 }
      )

    await prisma.msSatuanBarang.update({
      where: { id },
      data: { deleteAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: "Satuan berhasil dihapus"
    })
  } catch (error) {
    console.error("DELETE satuan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
