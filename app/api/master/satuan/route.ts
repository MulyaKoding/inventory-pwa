import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

// Helper: map Prisma record → frontend shape
function mapSatuan(s: {
  id: string
  kdSatuanBarang: string
  deskripsiSatuan: string
  deleteAt: Date | null
  Created_at?: Date
  Modified_at?: Date
}) {
  return {
    id: s.id,
    kode: s.kdSatuanBarang,
    nama: s.deskripsiSatuan,
    keterangan: ""
  }
}

// ── GET /api/master/satuan ──────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const where: any = {
      deleteAt: null,
      ...(search && {
        OR: [
          { deskripsiSatuan: { contains: search, mode: "insensitive" } },
          { kdSatuanBarang: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    const [raw, total] = await Promise.all([
      prisma.msSatuanBarang.findMany({
        where,
        orderBy: { deskripsiSatuan: "asc" },
        skip,
        take: limit
      }),
      prisma.msSatuanBarang.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: raw.map(mapSatuan),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("GET satuan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── POST /api/master/satuan ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    // frontend sends: { kode, nama, keterangan }
    const { kode, nama } = body

    if (!kode)
      return NextResponse.json(
        { error: "Kode satuan wajib diisi" },
        { status: 400 }
      )
    if (!nama)
      return NextResponse.json(
        { error: "Nama satuan wajib diisi" },
        { status: 400 }
      )

    const result = await prisma.msSatuanBarang.upsert({
      where: { kdSatuanBarang: kode },
      update: { deskripsiSatuan: nama, deleteAt: null },
      create: { kdSatuanBarang: kode, deskripsiSatuan: nama }
    })

    return NextResponse.json(
      { success: true, data: mapSatuan(result) },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST satuan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
