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
    const data = await prisma.msBarang.findFirst({
      where: { id, deleteAt: null },
      include: {
        supplier: true,
        pabrik: true,
        merek: true
      }
    })

    if (!data)
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      )
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("GET barang detail error:", error)
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

    const existing = await prisma.msBarang.findFirst({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      )

    // Validasi relasi jika diubah
    if (body.supplierCode) {
      const sup = await prisma.msSupplierBarang.findFirst({
        where: { supplierCode: body.supplierCode, deleteAt: null }
      })
      if (!sup)
        return NextResponse.json(
          { error: `Supplier ${body.supplierCode} tidak ditemukan` },
          { status: 400 }
        )
    }
    if (body.pabrikCode) {
      const pab = await prisma.msPabrikBarang.findFirst({
        where: { pabrikCode: body.pabrikCode, deleteAt: null }
      })
      if (!pab)
        return NextResponse.json(
          { error: `Pabrik ${body.pabrikCode} tidak ditemukan` },
          { status: 400 }
        )
    }
    if (body.merekCode) {
      const mrk = await prisma.msMerekBarang.findFirst({
        where: { merekCode: body.merekCode, deleteAt: null }
      })
      if (!mrk)
        return NextResponse.json(
          { error: `Merek ${body.merekCode} tidak ditemukan` },
          { status: 400 }
        )
    }

    const updated = await prisma.msBarang.update({
      where: { id },
      data: {
        ...(body.barangName !== undefined && { barangName: body.barangName }),
        ...(body.barangCategory !== undefined && {
          barangCategory: body.barangCategory
        }),
        ...(body.supplierCode !== undefined && {
          supplierCode: body.supplierCode
        }),
        ...(body.pabrikCode !== undefined && { pabrikCode: body.pabrikCode }),
        ...(body.merekCode !== undefined && { merekCode: body.merekCode }),
        ...(body.kdSatuanBarang !== undefined && {
          kdSatuanBarang: body.kdSatuanBarang
        }),
        ...(body.stock !== undefined && { stock: body.stock }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.status !== undefined && { status: body.status })
      },
      include: {
        supplier: { select: { supplierCode: true, supplierName: true } },
        pabrik: { select: { pabrikCode: true, pabrikName: true } },
        merek: { select: { merekCode: true, merekName: true } }
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT barang error:", error)
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
    const existing = await prisma.msBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!existing)
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      )

    await prisma.msBarang.update({
      where: { id },
      data: { deleteAt: new Date(), status: "inactive" }
    })

    return NextResponse.json({
      success: true,
      message: "Barang berhasil dihapus"
    })
  } catch (error) {
    console.error("DELETE barang error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
