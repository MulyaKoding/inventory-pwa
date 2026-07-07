import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

async function generateNoOpname(tanggal: string) {
  const ymd = new Date(tanggal).toISOString().slice(0, 10).replace(/-/g, "")
  const count = await prisma.stokOpname.count({
    where: { noOpname: { startsWith: `OPN-${ymd}` } }
  })
  return `OPN-${ymd}-${String(count + 1).padStart(4, "0")}`
}

async function generateNoAdjustment(tanggal: string) {
  const ymd = new Date(tanggal).toISOString().slice(0, 10).replace(/-/g, "")
  const count = await prisma.inventoryTransaction.count({
    where: { jenis: "penyesuaian", noTransaksi: { startsWith: `ADJ-${ymd}` } }
  })
  return `ADJ-${ymd}-${String(count + 1).padStart(4, "0")}`
}

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId")
  const data = await prisma.stokOpname.findMany({
    where: storeId ? { storeId } : {},
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ success: true, data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tanggal, storeId, keterangan, rows } = body

  if (!storeId)
    return NextResponse.json(
      { success: false, message: "storeId wajib diisi" },
      { status: 400 }
    )
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json(
      { success: false, message: "Data opname kosong" },
      { status: 400 }
    )

  const totalSelisih = rows.reduce(
    (sum: number, r: any) => sum + (Number(r.stokFisik) - Number(r.stokSistem)),
    0
  )

  const noOpname = await generateNoOpname(tanggal)

  const opname = await prisma.stokOpname.create({
    data: {
      noOpname,
      tanggal: new Date(tanggal),
      storeId,
      keterangan: keterangan || null,
      status: "selesai",
      totalSelisih,
      rows: rows.map((r: any) => ({
        barangCode: r.barangCode,
        barangNama: r.barangNama,
        satuanNama: r.satuanNama || null,
        stokSistem: Number(r.stokSistem),
        stokFisik: Number(r.stokFisik)
      }))
    }
  })

  // selisih dipisah jadi 2 transaksi penyesuaian (masuk / keluar) supaya arah tetap konsisten
  const naik = rows.filter(
    (r: any) => Number(r.stokFisik) > Number(r.stokSistem)
  )
  const turun = rows.filter(
    (r: any) => Number(r.stokFisik) < Number(r.stokSistem)
  )

  const buatPenyesuaian = async (list: any[], arah: "masuk" | "keluar") => {
    if (list.length === 0) return
    const noTransaksi = await generateNoAdjustment(tanggal)

    await prisma.inventoryTransaction.create({
      data: {
        noTransaksi,
        jenis: "penyesuaian",
        arah,
        tanggal: new Date(tanggal),
        storeId,
        alasan: "Selisih Stok Opname",
        keterangan: `Otomatis dari opname ${noOpname}`,
        status: "selesai",
        items: list.map((r: any) => ({
          barangCode: r.barangCode,
          barangNama: r.barangNama,
          satuanNama: r.satuanNama || null,
          qty: Math.abs(Number(r.stokFisik) - Number(r.stokSistem)),
          keterangan: null
        }))
      }
    })

    for (const r of list) {
      const delta =
        Math.abs(Number(r.stokFisik) - Number(r.stokSistem)) *
        (arah === "masuk" ? 1 : -1)
      await prisma.msBarang.updateMany({
        where: { barangCode: r.barangCode },
        data: { stock: { increment: delta } }
      })
    }
  }

  await buatPenyesuaian(naik, "masuk")
  await buatPenyesuaian(turun, "keluar")

  return NextResponse.json({ success: true, data: opname })
}
