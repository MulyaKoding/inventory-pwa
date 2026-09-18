import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Nomor HP dan password wajib diisi" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      )
    }

    const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

    // Cek OTP sudah diverifikasi dan belum expired
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: cleanPhone, verified: true },
      orderBy: { createdAt: "desc" }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verifikasi OTP diperlukan sebelum reset password" },
        { status: 400 }
      )
    }

    // Cek sesi verifikasi tidak lebih dari 10 menit
    if (otpRecord.expiresAt < new Date()) {
      await prisma.otpVerification.deleteMany({ where: { phone: cleanPhone } })
      return NextResponse.json(
        { error: "Sesi reset password telah kedaluwarsa, mulai ulang proses" },
        { status: 400 }
      )
    }

    // Cari user berdasarkan phone
    const user =
      (await prisma.user.findUnique({ where: { phone: cleanPhone } })) ||
      (await prisma.user.findUnique({ where: { phone: phone } }))

    if (!user) {
      return NextResponse.json(
        { error: "Akun tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Hapus OTP setelah berhasil
    await prisma.otpVerification.deleteMany({ where: { phone: cleanPhone } })

    return NextResponse.json(
      { message: "Password berhasil direset" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
