import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID!
const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY!
const DOKU_BASE_URL =
  process.env.DOKU_ENV === "production"
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com"

const PLAN_PRICES: Record<string, number> = {
  starter: 99000,
  growth: 299000,
  enterprise: 799000
}

function generateSignature(
  clientId: string,
  requestId: string,
  requestTimestamp: string,
  requestTarget: string,
  secretKey: string,
  body: string
): string {
  const digest = crypto.createHash("sha256").update(body).digest("base64")
  const componentToSign = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
    `Digest:${digest}`
  ].join("\n")
  return (
    "HMACSHA256=" +
    crypto
      .createHmac("sha256", secretKey)
      .update(componentToSign)
      .digest("base64")
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      plan,
      pic_name: picName,
      pic_email: picEmail,
      pic_phone: picPhone,
      company_name: companyName
    } = body

    const amount = PLAN_PRICES[plan]
    if (!amount) {
      return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 })
    }
    if (!picName || !picEmail) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    const requestId = crypto.randomUUID()
    const requestTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z")
    const invoiceNumber = `STOCKR-MITRA-${Date.now()}`
    const requestTarget = "/checkout/v1/payment"

    const payload = {
      order: {
        invoice_number: invoiceNumber,
        line_items: [
          {
            name: `STOCKR Mitra - Paket ${plan}`,
            price: amount,
            quantity: 1
          }
        ],
        amount,
        currency: "IDR",
        session_id: requestId,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mitra/payment-callback`,
        auto_redirect: false
      },
      customer: {
        name: picName,
        email: picEmail,
        phone: picPhone?.replace(/^0/, "62") ?? ""
      },
      payment: {
        payment_due_date: 15 // minutes
      }
    }

    const payloadStr = JSON.stringify(payload)
    const signature = generateSignature(
      DOKU_CLIENT_ID,
      requestId,
      requestTimestamp,
      requestTarget,
      DOKU_SECRET_KEY,
      payloadStr
    )

    const dokuRes = await fetch(`${DOKU_BASE_URL}${requestTarget}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": DOKU_CLIENT_ID,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Signature: signature
      },
      body: payloadStr
    })

    const dokuData = await dokuRes.json()
    console.log("[DOKU] full response:", JSON.stringify(dokuData, null, 2))

    if (!dokuRes.ok) {
      console.error("[DOKU] create-payment error:", dokuData)
      return NextResponse.json(
        { error: dokuData.error?.message ?? "Gagal membuat pembayaran DOKU" },
        { status: 500 }
      )
    }

    // Simpan record pembayaran ke DB
    await prisma.mitraPayment.create({
      data: {
        invoiceNumber,
        picName,
        picEmail,
        companyName,
        plan,
        amount,
        status: "pending",
        dokuRequestId: requestId,
        dokuSessionId: dokuData.response?.payment?.token_id ?? null
      }
    })

    return NextResponse.json({
      payment_id: invoiceNumber,
      qris_url: dokuData.response?.payment?.url ?? null,
      invoice_number: invoiceNumber,
      amount
    })
  } catch (err) {
    console.error("[create-payment] unexpected error:", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
