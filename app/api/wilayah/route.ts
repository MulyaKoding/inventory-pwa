import { NextRequest, NextResponse } from "next/server"

const BASE = "https://api.klinikme.com/api/v1"
const TOKEN = "Bearer token"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  let url = ""

  if (type === "provinsi") {
    url = `${BASE}/data_provinsi`
  } else if (type === "kota") {
    const provinsi = searchParams.get("provinsi")
    if (!provinsi)
      return NextResponse.json({ error: "provinsi required" }, { status: 400 })
    url = `${BASE}/data_kota?provinsi=${provinsi}`
  } else if (type === "kecamatan") {
    const kota = searchParams.get("kota")
    if (!kota)
      return NextResponse.json({ error: "kota required" }, { status: 400 })
    url = `${BASE}/data_kecamatan?kota=${kota}`
  } else if (type === "kelurahan") {
    const kecamatan = searchParams.get("kecamatan")
    if (!kecamatan)
      return NextResponse.json({ error: "kecamatan required" }, { status: 400 })
    url = `${BASE}/data_kelurahan?kecamatan=${kecamatan}`
  } else {
    return NextResponse.json({ error: "type tidak valid" }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
        Authorization: TOKEN // ← fix utama: tambah Authorization header
      },
      next: {
        revalidate: type === "provinsi" || type === "kota" ? 3600 : 300
      }
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Normalisasi response — pastikan selalu return { data: [] }
    // API klinikme return { status, message, data: [...] }
    return NextResponse.json(
      { data: data.data ?? data ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghubungi server wilayah" },
      { status: 500 }
    )
  }
}
