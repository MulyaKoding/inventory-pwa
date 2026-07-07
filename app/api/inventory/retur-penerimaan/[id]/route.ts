import { NextRequest } from "next/server"
import { updateTransaksi, deleteTransaksi } from "../../lib/handlers"

const JENIS = "retur-penerimaan" as const

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return updateTransaksi(JENIS, id, req)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return deleteTransaksi(id)
}
