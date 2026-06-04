import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

// ── GET /api/master/supplier/[id] ──────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const data = await prisma.msSupplierBarang.findFirst({
      where: { id, deleteAt: null }
    })

    if (!data)
      return NextResponse.json(
        { error: "Supplier tidak ditemukan" },
        { status: 404 }
      )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("GET supplier detail error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── PUT /api/master/supplier/[id] (upsert) ─────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const existing = await prisma.msSupplierBarang.findFirst({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { error: "Supplier tidak ditemukan" },
        { status: 404 }
      )

    const updated = await prisma.msSupplierBarang.update({
      where: { id },
      data: {
        ...(body.supplierName !== undefined && {
          supplierName: body.supplierName
        }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.province !== undefined && { province: body.province }),
        ...(body.picName !== undefined && { picName: body.picName }),
        ...(body.status !== undefined && { status: body.status })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT supplier error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

// ── DELETE /api/master/supplier/[id] (soft delete) ─────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const existing = await prisma.msSupplierBarang.findFirst({
      where: { id, deleteAt: null }
    })
    if (!existing)
      return NextResponse.json(
        { error: "Supplier tidak ditemukan" },
        { status: 404 }
      )

    await prisma.msSupplierBarang.update({
      where: { id },
      data: { deleteAt: new Date(), status: "inactive" }
    })

    return NextResponse.json({
      success: true,
      message: "Supplier berhasil dihapus"
    })
  } catch (error) {
    console.error("DELETE supplier error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
