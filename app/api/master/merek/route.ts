import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

async function generateMerekCode(storeId: string): Promise<string> {
  const count = await prisma.msMerekBarang.count({
    where: { storeId, deleteAt: null }
  })
  return `MRK-${String(count + 1).padStart(3, "0")}`
}

// ── GET /api/master/merek ───────────────────────────────
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
      storeId,
      deleteAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { merekName: { contains: search, mode: "insensitive" } },
          { merekCode: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    const [data, total] = await Promise.all([
      prisma.msMerekBarang.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.msMerekBarang.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error("GET merek error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── POST /api/master/merek ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const {
      merekCode,
      kode,
      merekName,
      nama,
      pabrikId,
      status = "active",
      storeId
    } = body

    const resolvedCode = merekCode || kode
    const resolvedName = merekName || nama

    if (!resolvedName)
      return NextResponse.json(
        { error: "Nama merek wajib diisi" },
        { status: 400 }
      )
    if (!storeId)
      return NextResponse.json(
        { error: "storeId wajib diisi" },
        { status: 400 }
      )

    const code = resolvedCode || (await generateMerekCode(storeId))

    const result = await prisma.msMerekBarang.upsert({
      where: { merekCode: code },
      update: {
        merekName: resolvedName,
        pabrikId: pabrikId ?? null,
        status,
        deleteAt: null
      },
      create: {
        merekCode: code,
        merekName: resolvedName,
        pabrikId: pabrikId ?? null,
        status,
        storeId,
        userId: user.userId
      }
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("POST merek error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
