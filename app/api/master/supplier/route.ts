import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"
import { notDeleted } from "@/app/lib/notDeleted"

// ── Generate supplier code ──────────────────────────────
async function generateSupplierCode(storeId: string): Promise<string> {
  const count = await prisma.msSupplierBarang.count({
    where: {
      storeId,
      OR: [{ deleteAt: null }, { deleteAt: { isSet: false } }]
    }
  })
  return `SUP-${String(count + 1).padStart(3, "0")}`
}

// ── GET /api/master/supplier ────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
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
      ...(search && {
        OR: [
          { supplierName: { contains: search, mode: "insensitive" } },
          { supplierCode: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    const [data, total] = await Promise.all([
      prisma.msSupplierBarang.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.msSupplierBarang.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("GET supplier error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── POST /api/master/supplier (upsert by supplierCode) ──
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const {
      supplierCode,
      kode,
      supplierName,
      nama,
      phone,
      telepon,
      email,
      address,
      alamat,
      city,
      kota,
      province, // ← tambahkan ini
      picName,
      kontakPerson,
      status = "active",
      storeId
    } = body

    const resolvedCode = supplierCode || kode
    const resolvedName = supplierName || nama
    const resolvedPhone = phone || telepon || null
    const resolvedAddress = address || alamat || null
    const resolvedCity = city || kota || null
    const resolvedPic = picName || kontakPerson || null

    // Validasi pakai resolved vars:
    if (!resolvedName)
      return NextResponse.json(
        { error: "Nama supplier wajib diisi" },
        { status: 400 }
      )
    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    const code = resolvedCode || (await generateSupplierCode(storeId))

    const result = await prisma.msSupplierBarang.upsert({
      where: { supplierCode: code },
      update: {
        supplierName: resolvedName,
        phone: resolvedPhone,
        email: email ?? null,
        address: resolvedAddress,
        city: resolvedCity,
        province: province ?? null,
        picName: resolvedPic,
        status,
        deleteAt: null
      },
      create: {
        supplierCode: code,
        supplierName: resolvedName,
        phone: resolvedPhone,
        email: email ?? null,
        address: resolvedAddress,
        city: resolvedCity,
        province: province ?? null,
        picName: resolvedPic,
        status,
        storeId,
        userId: user.userId,
        deleteAt: null
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("POST supplier error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
