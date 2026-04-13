// app/api/mitra/payment-status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 })
    }

    const payment = await prisma.mitraPayment.findUnique({
      where: { invoiceNumber: id },
      select: { status: true, amount: true, plan: true, paidAt: true }
    })

    if (!payment) {
      // Belum ada record = masih pending
      return NextResponse.json({ status: "pending" })
    }

    return NextResponse.json({
      status: payment.status, // "pending" | "paid" | "failed" | "expired"
      amount: payment.amount,
      plan: payment.plan,
      paid_at: payment.paidAt
    })
  } catch (err) {
    console.error("[payment-status] error:", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
