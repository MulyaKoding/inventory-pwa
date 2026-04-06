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

    // Format nomor: hilangkan +, pastikan pakai 62
    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 menit

    // Hapus OTP lama untuk nomor ini
    await prisma.otpVerification.deleteMany({ where: { phone: cleanPhone } })

    // Simpan OTP baru
    await prisma.otpVerification.create({
      data: { phone: cleanPhone, otp, expiresAt }
    })

    // Kirim via Fonnte
    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_TOKEN!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: `*STOCKR*\n\nKode OTP kamu: *${otp}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.`,
        countryCode: "62"
      })
    })

    const result = await res.json()

    if (!result.status) {
      console.error("Fonnte error:", result)
      return NextResponse.json(
        { error: "Gagal mengirim OTP, cek nomor HP kamu" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP terkirim ke WhatsApp kamu"
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
