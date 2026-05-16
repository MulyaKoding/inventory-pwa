import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  // Block di production
  if (process.env.DOKU_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const { invoiceNumber } = await req.json()
  if (!invoiceNumber) {
    return NextResponse.json(
      { error: "invoiceNumber required" },
      { status: 400 }
    )
  }

  // Update payment status → paid
  await prisma.mitraPayment.update({
    where: { invoiceNumber },
    data: {
      status: "paid",
      paidAt: new Date(),
      rawResponse: JSON.stringify({ mock: true, timestamp: new Date() })
    }
  })

  // Aktifkan mitra jika sudah terdaftar
  await prisma.mitra.updateMany({
    where: { paymentId: invoiceNumber },
    data: { status: "active", activatedAt: new Date() }
  })

  return NextResponse.json({ ok: true, message: "Payment mocked as paid" })
}
