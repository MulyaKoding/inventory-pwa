import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

async function generatePabrikCode(storeId: string): Promise<string> {
  const count = await prisma.msPabrikBarang.count({
    where: { storeId, deleteAt: null }
  })
  return `PAB-${String(count + 1).padStart(3, "0")}`
}

// ── GET /api/master/pabrik ──────────────────────────────
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

    const where: any = {
      userId: user.userId, // filter by user jika tidak ada storeId
      deleteAt: null,
      ...(storeId && { storeId }), // filter by storeId jika ada
      ...(status && { status }),
      ...(search && {
        OR: [
          { pabrikName: { contains: search, mode: "insensitive" } },
          { pabrikCode: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    const [data, total] = await Promise.all([
      prisma.msPabrikBarang.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.msPabrikBarang.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("GET pabrik error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── POST /api/master/pabrik ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const {
      pabrikCode,
      kode,
      pabrikName,
      nama,
      phone,
      telepon,
      email,
      address,
      alamat,
      city,
      kota,
      province,
      country,
      status = "active",
      storeId
    } = body

    const resolvedName = pabrikName || nama
    const resolvedPhone = phone || telepon || null
    const resolvedAddress = address || alamat || null
    const resolvedCity = city || kota || null
    const resolvedCode = pabrikCode || kode

    if (!resolvedName)
      return NextResponse.json(
        { error: "Nama pabrik wajib diisi" },
        { status: 400 }
      )
    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    const code = resolvedCode || (await generatePabrikCode(storeId))

    const result = await prisma.msPabrikBarang.upsert({
      where: { pabrikCode: code },
      update: {
        pabrikName: resolvedName,
        phone: resolvedPhone,
        email: email ?? null,
        address: resolvedAddress,
        city: resolvedCity,
        province: province ?? null,
        country: country ?? "Indonesia",
        status,
        deleteAt: null
      },
      create: {
        pabrikCode: code,
        pabrikName: resolvedName,
        phone: resolvedPhone,
        email: email ?? null,
        address: resolvedAddress,
        city: resolvedCity,
        province: province ?? null,
        country: country ?? "Indonesia",
        status,
        storeId,
        userId: user.userId
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("POST pabrik error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
