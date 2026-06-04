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

    // Validasi supplier
    if (body.merekCode && body.merekCode !== existing.merekCode) {
      const mrk = await prisma.msMerekBarang.findFirst({
        where: {
          merekCode: body.merekCode,
          OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
        }
      })
      if (!mrk)
        return NextResponse.json(
          { error: `Merek tidak ditemukan` },
          { status: 400 }
        )
    }

    // Sama untuk supplier
    if (body.supplierCode && body.supplierCode !== existing.supplierCode) {
      const sup = await prisma.msSupplierBarang.findFirst({
        where: {
          supplierCode: body.supplierCode,
          OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
        }
      })
      if (!sup)
        return NextResponse.json(
          { error: `Supplier tidak ditemukan` },
          { status: 400 }
        )
    }

    // Sama untuk pabrik
    if (body.pabrikCode && body.pabrikCode !== existing.pabrikCode) {
      const pab = await prisma.msPabrikBarang.findFirst({
        where: {
          pabrikCode: body.pabrikCode,
          OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
        }
      })
      if (!pab)
        return NextResponse.json(
          { error: `Pabrik tidak ditemukan` },
          { status: 400 }
        )
    }

    const updated = await prisma.msBarang.update({
      where: { id },
      data: {
        ...((body.barangName || body.nama) && {
          barangName: body.barangName || body.nama
        }),
        ...((body.barangCode || body.kode) && {
          barangCode: body.barangCode || body.kode
        }),
        ...((body.barangCategory || body.jenis) !== undefined && {
          barangCategory: body.barangCategory || body.jenis || null
        }),
        ...(body.supplierCode !== undefined && {
          supplierCode: body.supplierCode || null
        }),
        ...(body.pabrikCode !== undefined && {
          pabrikCode: body.pabrikCode || null
        }),
        ...(body.merekCode !== undefined && {
          merekCode: body.merekCode || null
        }),
        ...(body.kdSatuanBarang !== undefined && {
          kdSatuanBarang: body.kdSatuanBarang
        }),
        ...(body.barcode !== undefined && { barcode: body.barcode }),
        ...((body.stock !== undefined || body.stokMinimum !== undefined) && {
          stock: Number(body.stock ?? body.stokMinimum ?? 0)
        }),
        ...((body.price !== undefined || body.hargaJual !== undefined) && {
          price: Number(body.price ?? body.hargaJual ?? 0)
        }),
        ...(body.hargaBeli !== undefined && {
          hargaBeli: Number(body.hargaBeli)
        }),
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
