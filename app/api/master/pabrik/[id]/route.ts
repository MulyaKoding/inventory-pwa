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
    const data = await prisma.msPabrikBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!data)
      return NextResponse.json(
        { error: "Pabrik tidak ditemukan" },
        { status: 404 }
      )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("GET pabrik detail error:", error)
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

    const existing = await prisma.msPabrikBarang.findFirst({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { error: "Pabrik tidak ditemukan" },
        { status: 404 }
      )

    const updated = await prisma.msPabrikBarang.update({
      where: { id },
      data: {
        ...((body.pabrikName || body.nama) && {
          pabrikName: body.pabrikName || body.nama
        }),
        ...((body.pabrikCode || body.kode) && {
          pabrikCode: body.pabrikCode || body.kode
        }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.telepon !== undefined && { phone: body.telepon }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.alamat !== undefined && { address: body.alamat }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.kota !== undefined && { city: body.kota }),
        ...(body.status !== undefined && { status: body.status })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT pabrik error:", error)
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
    const existing = await prisma.msPabrikBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!existing)
      return NextResponse.json(
        { error: "Pabrik tidak ditemukan" },
        { status: 404 }
      )

    await prisma.msPabrikBarang.update({
      where: { id },
      data: { deleteAt: new Date(), status: "inactive" }
    })

    return NextResponse.json({
      success: true,
      message: "Pabrik berhasil dihapus"
    })
  } catch (error) {
    console.error("DELETE pabrik error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
