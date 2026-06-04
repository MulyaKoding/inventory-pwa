import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

async function generateBarangCode(storeId: string): Promise<string> {
  const count = await prisma.msBarang.count({
    where: { storeId, deleteAt: null }
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
      storeId,
      deleteAt: null,
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
      barangName,
      barangCategory,
      supplierCode,
      pabrikCode,
      merekCode,
      kdSatuanBarang,
      stock = 0,
      price = 0,
      status = "active",
      storeId
    } = body

    if (!barangName)
      return NextResponse.json(
        { error: "Nama barang wajib diisi" },
        { status: 400 }
      )
    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    // Validasi relasi jika diisi
    if (supplierCode) {
      const sup = await prisma.msSupplierBarang.findFirst({
        where: { supplierCode, deleteAt: null }
      })
      if (!sup)
        return NextResponse.json(
          { error: `Supplier ${supplierCode} tidak ditemukan` },
          { status: 400 }
        )
    }
    if (pabrikCode) {
      const pab = await prisma.msPabrikBarang.findFirst({
        where: { pabrikCode, deleteAt: null }
      })
      if (!pab)
        return NextResponse.json(
          { error: `Pabrik ${pabrikCode} tidak ditemukan` },
          { status: 400 }
        )
    }
    if (merekCode) {
      const mrk = await prisma.msMerekBarang.findFirst({
        where: { merekCode, deleteAt: null }
      })
      if (!mrk)
        return NextResponse.json(
          { error: `Merek ${merekCode} tidak ditemukan` },
          { status: 400 }
        )
    }
    if (kdSatuanBarang) {
      const sat = await prisma.msSatuanBarang.findFirst({
        where: { kdSatuanBarang }
      })
      if (!sat)
        return NextResponse.json(
          { error: `Satuan ${kdSatuanBarang} tidak ditemukan` },
          { status: 400 }
        )
    }

    const code = barangCode || (await generateBarangCode(storeId))

    const result = await prisma.msBarang.upsert({
      where: { barangCode: code },
      update: {
        barangName,
        barangCategory: barangCategory ?? null,
        supplierCode: supplierCode ?? null,
        pabrikCode: pabrikCode ?? null,
        merekCode: merekCode ?? null,
        kdSatuanBarang: kdSatuanBarang ?? null,
        stock,
        price,
        status,
        deleteAt: null
      },
      create: {
        barangCode: code,
        barangName,
        barangCategory: barangCategory ?? null,
        supplierCode: supplierCode ?? null,
        pabrikCode: pabrikCode ?? null,
        merekCode: merekCode ?? null,
        kdSatuanBarang: kdSatuanBarang ?? null,
        stock,
        price,
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
