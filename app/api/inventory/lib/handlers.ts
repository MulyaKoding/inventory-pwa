import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { JENIS_CONFIG, JenisTransaksi } from "./config"

async function generateNoTransaksi(jenis: JenisTransaksi, tanggal: string) {
  const prefix = JENIS_CONFIG[jenis].prefix
  const ymd = new Date(tanggal).toISOString().slice(0, 10).replace(/-/g, "")
  const count = await prisma.inventoryTransaction.count({
    where: { jenis, noTransaksi: { startsWith: `${prefix}-${ymd}` } }
  })
  return `${prefix}-${ymd}-${String(count + 1).padStart(4, "0")}`
}

// ── LIST ─────────────────────────────────────────────────
export async function listTransaksi(
  jenis: JenisTransaksi,
  storeId: string | null
) {
  const data = await prisma.inventoryTransaction.findMany({
    where: { jenis, ...(storeId ? { storeId } : {}) },
    orderBy: { createdAt: "desc" }
  })
  return NextResponse.json({ success: true, data })
}

// ── CREATE ───────────────────────────────────────────────
export async function createTransaksi(jenis: JenisTransaksi, req: NextRequest) {
  const body = await req.json()
  const {
    tanggal,
    storeId,
    partnerCode,
    partnerNama,
    alasan,
    keterangan,
    items,
    arah
  } = body

  if (!storeId)
    return NextResponse.json(
      { success: false, message: "storeId wajib diisi" },
      { status: 400 }
    )
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json(
      { success: false, message: "Minimal 1 barang" },
      { status: 400 }
    )

  const cfg = JENIS_CONFIG[jenis]
  const resolvedArah = cfg.arah ?? arah
  if (resolvedArah !== "masuk" && resolvedArah !== "keluar")
    return NextResponse.json(
      { success: false, message: "Arah transaksi tidak valid (masuk/keluar)" },
      { status: 400 }
    )
  const wajibAlasan =
    jenis === "penyesuaian" ||
    jenis === "retur-penerimaan" ||
    jenis === "retur-pengeluaran"
  if (wajibAlasan && !alasan)
    return NextResponse.json(
      { success: false, message: "Alasan wajib diisi" },
      { status: 400 }
    )

  // ambil nama/satuan terbaru dari master barang biar konsisten
  const barangCodes = items.map((it: any) => it.barangCode)
  const masterBarang = await prisma.msBarang.findMany({
    where: { barangCode: { in: barangCodes } }
  })
  const masterMap = new Map(masterBarang.map((b) => [b.barangCode, b]))

  const noTransaksi = await generateNoTransaksi(jenis, tanggal)

  const created = await prisma.inventoryTransaction.create({
    data: {
      noTransaksi,
      jenis,
      arah: resolvedArah,
      tanggal: new Date(tanggal),
      storeId,
      partnerCode: partnerCode || null,
      partnerNama: partnerNama || null,
      alasan: alasan || null,
      keterangan: keterangan || null,
      status: "selesai",
      items: items.map((it: any) => ({
        barangCode: it.barangCode,
        barangNama:
          masterMap.get(it.barangCode)?.barangName ?? it.barangNama ?? "",
        satuanNama: it.satuanNama || null,
        qty: Number(it.qty),
        keterangan: it.keterangan || null
      }))
    }
  })

  // update stok berjalan di MsBarang.stock
  for (const it of items) {
    const delta = resolvedArah === "masuk" ? Number(it.qty) : -Number(it.qty)
    await prisma.msBarang.updateMany({
      where: { barangCode: it.barangCode },
      data: { stock: { increment: delta } }
    })
  }

  return NextResponse.json({ success: true, data: created })
}

// ── UPDATE ───────────────────────────────────────────────
export async function updateTransaksi(
  jenis: JenisTransaksi,
  id: string,
  req: NextRequest
) {
  const body = await req.json()
  const existing = await prisma.inventoryTransaction.findUnique({
    where: { id }
  })
  if (!existing)
    return NextResponse.json(
      { success: false, message: "Data tidak ditemukan" },
      { status: 404 }
    )

  // balikin dulu efek stok dari data lama, biar stok tetap akurat setelah diedit
  for (const it of existing.items) {
    const revert = existing.arah === "masuk" ? -it.qty : it.qty
    await prisma.msBarang.updateMany({
      where: { barangCode: it.barangCode },
      data: { stock: { increment: revert } }
    })
  }

  const cfg = JENIS_CONFIG[jenis]
  const resolvedArah = cfg.arah ?? body.arah ?? existing.arah

  const barangCodes = (body.items ?? []).map((it: any) => it.barangCode)
  const masterBarang = await prisma.msBarang.findMany({
    where: { barangCode: { in: barangCodes } }
  })
  const masterMap = new Map(masterBarang.map((b) => [b.barangCode, b]))

  const updated = await prisma.inventoryTransaction.update({
    where: { id },
    data: {
      tanggal: new Date(body.tanggal),
      partnerCode: body.partnerCode || null,
      partnerNama: body.partnerNama || null,
      alasan: body.alasan || null,
      keterangan: body.keterangan || null,
      arah: resolvedArah,
      items: (body.items ?? []).map((it: any) => ({
        barangCode: it.barangCode,
        barangNama:
          masterMap.get(it.barangCode)?.barangName ?? it.barangNama ?? "",
        satuanNama: it.satuanNama || null,
        qty: Number(it.qty),
        keterangan: it.keterangan || null
      }))
    }
  })

  // terapkan efek stok yang baru
  for (const it of body.items ?? []) {
    const delta = resolvedArah === "masuk" ? Number(it.qty) : -Number(it.qty)
    await prisma.msBarang.updateMany({
      where: { barangCode: it.barangCode },
      data: { stock: { increment: delta } }
    })
  }

  return NextResponse.json({ success: true, data: updated })
}

// ── DELETE ───────────────────────────────────────────────
export async function deleteTransaksi(id: string) {
  const existing = await prisma.inventoryTransaction.findUnique({
    where: { id }
  })
  if (!existing)
    return NextResponse.json(
      { success: false, message: "Data tidak ditemukan" },
      { status: 404 }
    )

  // balikin efek stok sebelum data dihapus
  for (const it of existing.items) {
    const revert = existing.arah === "masuk" ? -it.qty : it.qty
    await prisma.msBarang.updateMany({
      where: { barangCode: it.barangCode },
      data: { stock: { increment: revert } }
    })
  }

  await prisma.inventoryTransaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
