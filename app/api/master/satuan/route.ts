import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

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

    const [data, total] = await Promise.all([
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
      data,
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
    const { kdSatuanBarang, deskripsiSatuan } = body

    if (!kdSatuanBarang)
      return NextResponse.json(
        { error: "Kode satuan wajib diisi" },
        { status: 400 }
      )
    if (!deskripsiSatuan)
      return NextResponse.json(
        { error: "Deskripsi satuan wajib diisi" },
        { status: 400 }
      )

    const result = await prisma.msSatuanBarang.upsert({
      where: { kdSatuanBarang },
      update: { deskripsiSatuan, deleteAt: null },
      create: { kdSatuanBarang, deskripsiSatuan }
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("POST satuan error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
