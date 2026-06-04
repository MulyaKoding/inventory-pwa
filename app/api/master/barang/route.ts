import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"
import { notDeleted } from "@/app/lib/notDeleted"

async function generateBarangCode(storeId: string): Promise<string> {
  const count = await prisma.msBarang.count({
    where: {
      storeId,
      OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
    }
  })
  return `BRG-${String(count + 1).padStart(4, "0")}`
}

// ── GET /api/master/barang ──────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const supplierCode = searchParams.get("supplierCode") || ""
    const pabrikCode = searchParams.get("pabrikCode") || ""
    const merekCode = searchParams.get("merekCode") || ""
    const category = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    const where: any = {
      ...notDeleted,
      storeId,
      ...(status && { status }),
      ...(supplierCode && { supplierCode }),
      ...(pabrikCode && { pabrikCode }),
      ...(merekCode && { merekCode }),
      ...(category && { barangCategory: category }),
      ...(search && {
        OR: [
          { barangName: { contains: search, mode: "insensitive" } },
          { barangCode: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    const [data, total] = await Promise.all([
      prisma.msBarang.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          supplier: { select: { supplierCode: true, supplierName: true } },
          pabrik: { select: { pabrikCode: true, pabrikName: true } },
          merek: { select: { merekCode: true, merekName: true } }
        }
      }),
      prisma.msBarang.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("GET barang error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── POST /api/master/barang ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const {
      barangCode,
      kode,
      barangName,
      nama,
      barangCategory,
      jenis,
      supplierCode,
      supplierId,
      pabrikCode,
      merekCode,
      merekId,
      kdSatuanBarang,
      satuanId,
      hargaBeli,
      hargaJual,
      stokMinimum,
      barcode,
      status = "active",
      storeId
    } = body

    const resolvedCode = barangCode || kode
    const resolvedName = barangName || nama
    const resolvedCategory = barangCategory || jenis || null
    const resolvedSupplier = supplierCode || supplierId || null
    const resolvedMerek = merekCode || merekId || null
    const resolvedSatuan = kdSatuanBarang || satuanId || null
    const resolvedPrice = Number(hargaJual ?? 0)
    const resolvedStock = Number(stokMinimum ?? 0)

    // Validasi pakai resolved vars:
    if (!resolvedName)
      return NextResponse.json(
        { error: "Nama barang wajib diisi" },
        { status: 400 }
      )
    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    // Validasi relasi pakai resolved vars:
    if (resolvedSupplier) {
      const sup = await prisma.msSupplierBarang.findFirst({
        where: { supplierCode: resolvedSupplier, deleteAt: null }
      })
      if (!sup)
        return NextResponse.json(
          { error: `Supplier tidak ditemukan` },
          { status: 400 }
        )
    }
    if (pabrikCode) {
      const pab = await prisma.msPabrikBarang.findFirst({
        where: { pabrikCode, deleteAt: null }
      })
      if (!pab)
        return NextResponse.json(
          { error: `Pabrik tidak ditemukan` },
          { status: 400 }
        )
    }
    if (resolvedMerek) {
      const mrk = await prisma.msMerekBarang.findFirst({
        where: { merekCode: resolvedMerek, deleteAt: null }
      })
      if (!mrk)
        return NextResponse.json(
          { error: `Merek tidak ditemukan` },
          { status: 400 }
        )
    }
    if (resolvedSatuan) {
      const sat = await prisma.msSatuanBarang.findFirst({
        where: { kdSatuanBarang: resolvedSatuan }
      })
      if (!sat)
        return NextResponse.json(
          { error: `Satuan tidak ditemukan` },
          { status: 400 }
        )
    }

    const code = resolvedCode || (await generateBarangCode(storeId))

    const result = await prisma.msBarang.upsert({
      where: { barangCode: code },
      update: {
        barangName: resolvedName,
        barangCategory: resolvedCategory,
        supplierCode: resolvedSupplier,
        pabrikCode: pabrikCode ?? null,
        merekCode: resolvedMerek,
        kdSatuanBarang: resolvedSatuan,
        stock: resolvedStock,
        price: resolvedPrice,
        status,
        deleteAt: null
      },
      create: {
        barangCode: code,
        barangName: resolvedName,
        barangCategory: resolvedCategory,
        supplierCode: resolvedSupplier,
        pabrikCode: pabrikCode ?? null,
        merekCode: resolvedMerek,
        kdSatuanBarang: resolvedSatuan,
        stock: resolvedStock,
        price: resolvedPrice,
        status,
        storeId,
        userId: user.userId
      },
      include: {
        supplier: { select: { supplierCode: true, supplierName: true } },
        pabrik: { select: { pabrikCode: true, pabrikName: true } },
        merek: { select: { merekCode: true, merekName: true } }
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("POST barang error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
