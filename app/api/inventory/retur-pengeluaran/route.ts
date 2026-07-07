import { NextRequest } from "next/server"
import { listTransaksi, createTransaksi } from "../lib/handlers"

const JENIS = "retur-pengeluaran" as const

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get("storeId")
  return listTransaksi(JENIS, storeId)
}

export async function POST(req: NextRequest) {
  return createTransaksi(JENIS, req)
}
