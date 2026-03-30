import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

// GET - Ambil semua produk
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}

// POST - Tambah produk baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, category, sku, stock, price } = body

    if (!name || !category || !sku || stock === undefined || !price) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      )
    }

    // Cek SKU sudah ada
    const existing = await prisma.product.findUnique({ where: { sku } })
    if (existing) {
      return NextResponse.json(
        { error: "SKU sudah digunakan" },
        { status: 409 }
      )
    }

    // Auto generate productId
    const count = await prisma.product.count()
    const productId = `PRD-${String(count + 1).padStart(3, "0")}`

    // Auto set status berdasarkan stock
    let status = "In Stock"
    if (stock === 0) status = "Out of Stock"
    else if (stock < 15) status = "Low Stock"

    const product = await prisma.product.create({
      data: {
        productId,
        name,
        category,
        sku,
        stock: Number(stock),
        price: Number(price),
        status,
        sold: 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Gagal menambah produk" },
      { status: 500 }
    )
  }
}
