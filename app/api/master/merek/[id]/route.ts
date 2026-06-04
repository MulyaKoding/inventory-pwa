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
    const data = await prisma.msMerekBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!data)
      return NextResponse.json(
        { error: "Merek tidak ditemukan" },
        { status: 404 }
      )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("GET merek detail error:", error)
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

    const existing = await prisma.msMerekBarang.findFirst({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { error: "Merek tidak ditemukan" },
        { status: 404 }
      )

    // Resolve field names dari frontend (kode/nama) maupun API langsung (merekCode/merekName)
    const resolvedName = body.merekName || body.nama
    const resolvedCode = body.merekCode || body.kode

    // pabrikId dari frontend adalah id MongoDB, cari kodenya dulu
    let resolvedPabrikCode: string | null | undefined = undefined
    if (body.pabrikCode !== undefined) {
      resolvedPabrikCode = body.pabrikCode || null
    } else if (body.pabrikId !== undefined) {
      if (!body.pabrikId) {
        resolvedPabrikCode = null
      } else {
        const pabrik = await prisma.msPabrikBarang.findUnique({
          where: { id: body.pabrikId }
        })
        resolvedPabrikCode = pabrik?.pabrikCode || null
      }
    }

    const updated = await prisma.msMerekBarang.update({
      where: { id },
      data: {
        ...(resolvedCode && { merekCode: resolvedCode }),
        ...(resolvedName && { merekName: resolvedName }),
        ...(resolvedPabrikCode !== undefined && {
          pabrikCode: resolvedPabrikCode
        }),
        ...(body.status !== undefined && { status: body.status })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT merek error:", error)
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
    const existing = await prisma.msMerekBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!existing)
      return NextResponse.json(
        { error: "Merek tidak ditemukan" },
        { status: 404 }
      )

    await prisma.msMerekBarang.update({
      where: { id },
      data: { deleteAt: new Date(), status: "inactive" }
    })

    return NextResponse.json({
      success: true,
      message: "Merek berhasil dihapus"
    })
  } catch (error) {
    console.error("DELETE merek error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
