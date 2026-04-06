import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json()

    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

    const record = await prisma.otpVerification.findFirst({
      where: { phone: cleanPhone, verified: false },
      orderBy: { createdAt: "desc" }
    })

    if (!record) {
      return NextResponse.json(
        { error: "OTP tidak ditemukan" },
        { status: 400 }
      )
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json(
        { error: "OTP sudah expired, minta ulang" },
        { status: 400 }
      )
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Kode OTP salah" }, { status: 400 })
    }

    // Tandai OTP sebagai verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    })

    return NextResponse.json({ success: true, message: "OTP valid" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
