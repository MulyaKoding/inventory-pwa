// app/api/mitra/payment-callback/route.ts
// Webhook dari DOKU — dipanggil otomatis saat status pembayaran berubah
// Daftarkan URL ini di DOKU Dashboard → Settings → Notification URL

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY!

function verifyDokuSignature(
  req: NextRequest,
  rawBody: string,
  requestTarget: string
): boolean {
  const signature = req.headers.get("Signature") ?? ""
  const clientId = req.headers.get("Client-Id") ?? ""
  const requestId = req.headers.get("Request-Id") ?? ""
  const requestTimestamp = req.headers.get("Request-Timestamp") ?? ""

  const digest = crypto.createHash("sha256").update(rawBody).digest("base64")
  const componentToSign = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
    `Digest:${digest}`
  ].join("\n")

  const expected =
    "HMACSHA256=" +
    crypto
      .createHmac("sha256", DOKU_SECRET_KEY)
      .update(componentToSign)
      .digest("base64")

  return signature === expected
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const data = JSON.parse(rawBody)

    // Verifikasi signature DOKU
    const isValid = verifyDokuSignature(
      req,
      rawBody,
      "/api/mitra/payment-callback"
    )
    if (!isValid) {
      console.warn("[payment-callback] Invalid DOKU signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Ambil data dari payload DOKU
    const invoiceNumber = data.order?.invoice_number as string | undefined
    const dokuStatus = data.transaction?.status as string | undefined
    // DOKU status: "SUCCESS" | "FAILED" | "EXPIRED" | "PENDING"

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "invoice_number tidak ditemukan" },
        { status: 400 }
      )
    }

    const status =
      dokuStatus === "SUCCESS"
        ? "paid"
        : dokuStatus === "FAILED"
          ? "failed"
          : dokuStatus === "EXPIRED"
            ? "expired"
            : "pending"

    // Update status di DB
    await prisma.mitraPayment.update({
      where: { invoiceNumber },
      data: {
        status,
        rawResponse: rawBody,
        paidAt: status === "paid" ? new Date() : null
      }
    })

    // Jika berhasil bayar, aktifkan mitra
    if (status === "paid") {
      await prisma.mitra.updateMany({
        where: { paymentId: invoiceNumber },
        data: { status: "active", activatedAt: new Date() }
      })
    }

    console.log(`[payment-callback] ${invoiceNumber} → ${status}`)
    return NextResponse.json({ message: "OK" })
  } catch (err) {
    console.error("[payment-callback] error:", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
