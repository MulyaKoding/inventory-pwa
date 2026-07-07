import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId")

  const [barangList, transaksi] = await Promise.all([
    prisma.msBarang.findMany({ where: storeId ? { storeId } : {} }),
    prisma.inventoryTransaction.findMany({ where: storeId ? { storeId } : {} })
  ])

  // agregat histori masuk/keluar per barangCode (untuk kolom "Masuk" & "Keluar")
  const masukMap = new Map<string, number>()
  const keluarMap = new Map<string, number>()
  for (const t of transaksi) {
    const map = t.arah === "masuk" ? masukMap : keluarMap
    for (const it of t.items) {
      map.set(it.barangCode, (map.get(it.barangCode) ?? 0) + it.qty)
    }
  }

  const data = barangList.map((b) => ({
    id: b.id,
    barangCode: b.barangCode,
    barangName: b.barangName,
    satuanNama: b.kdSatuanBarang ?? "",
    stokMasuk: masukMap.get(b.barangCode) ?? 0,
    stokKeluar: keluarMap.get(b.barangCode) ?? 0,
    // stok akhir = stok berjalan yang di-maintain langsung di MsBarang.stock
    // tiap kali ada transaksi (lihat _lib/handlers.ts) — ini source of truth-nya,
    // bukan hasil hitung ulang dari histori, supaya konsisten walau ada transaksi lama yang dihapus/diedit.
    stokAkhir: b.stock,
    // TODO: tambahkan field `stokMinimum` di model MsBarang kalau mau highlight stok kritis.
    stokMinimum: 0
  }))

  return NextResponse.json({ success: true, data })
}
