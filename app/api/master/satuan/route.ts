import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

function mapSatuan(s: {
  id: string
  kdSatuanBarang: string
  deskripsiSatuan: string
  deleteAt: Date | null
}) {
  return {
    id: s.id,
    kode: s.kdSatuanBarang,
    nama: s.deskripsiSatuan,
    keterangan: ""
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const raw = await prisma.msSatuanBarang.findMany({
      where: { deleteAt: null },
      orderBy: { deskripsiSatuan: "asc" },
      take: 200
    })

    return NextResponse.json({ success: true, data: raw.map(mapSatuan) })
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", detail: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { kode, nama } = await req.json()
    if (!kode)
      return NextResponse.json({ error: "Kode wajib diisi" }, { status: 400 })
    if (!nama)
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 })

    const existing = await prisma.msSatuanBarang.findFirst({
      where: { kdSatuanBarang: kode, deleteAt: null }
    })
    if (existing)
      return NextResponse.json(
        { error: `Kode "${kode}" sudah digunakan` },
        { status: 409 }
      )

    const result = await prisma.msSatuanBarang.create({
      data: {
        kdSatuanBarang: kode,
        deskripsiSatuan: nama,
        deleteAt: null
      }
    })

    return NextResponse.json(
      { success: true, data: mapSatuan(result) },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", detail: error?.message },
      { status: 500 }
    )
  }
}
