import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { error: "Nomor HP wajib diisi" },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.otpVerification.deleteMany({ where: { phone: cleanPhone } })
    await prisma.otpVerification.create({
      data: { phone: cleanPhone, otp, expiresAt }
    })

    // Fonnte pakai form-data, BUKAN JSON
    const formData = new URLSearchParams()
    formData.append("target", cleanPhone)
    formData.append(
      "message",
      `*STOCKR*\n\nKode OTP kamu: *${otp}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.`
    )
    formData.append("countryCode", "62")

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_TOKEN || "fallback-token"
        // TIDAK perlu Content-Type JSON untuk Fonnte
      },
      body: formData
    })

    const result = await res.json()
    console.log("Fonnte response:", JSON.stringify(result)) // ← lihat di Vercel logs

    if (!result.status) {
      return NextResponse.json(
        {
          error: "Gagal mengirim OTP",
          detail: result.reason || result.message || result // ← expose detail error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP terkirim ke WhatsApp kamu"
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Server error", detail: String(error) },
      { status: 500 }
    )
  }
}
