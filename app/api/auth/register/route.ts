import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
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

    // Pastikan OTP sudah diverifikasi
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: cleanPhone, verified: true },
      orderBy: { createdAt: "desc" }
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Nomor HP belum diverifikasi, verifikasi OTP dulu" },
        { status: 400 }
      )
    }

    // Cek email & phone sudah terdaftar
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      )
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    })
    if (existingPhone) {
      return NextResponse.json(
        { error: "Nomor HP sudah terdaftar" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: cleanPhone,
        password: hashedPassword,
        isVerified: true
      }
    })

    // Hapus OTP setelah berhasil register
    await prisma.otpVerification.deleteMany({ where: { phone: cleanPhone } })

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
