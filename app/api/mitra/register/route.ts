import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

const PLAN_PRICES: Record<string, number> = {
  starter: 99000,
  growth: 299000,
  enterprise: 799000
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      pic_name,
      pic_email,
      pic_phone,
      pic_position,
      pic_ktp,
      company_name,
      company_type,
      company_npwp,
      company_address,
      company_city,
      company_province,
      company_postal,
      company_website,
      employee_count,
      plan,
      payment_id
    } = body

    if (!pic_name || !pic_email || !company_name || !plan || !payment_id) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    // Cek apakah pembayaran benar-benar sudah paid
    const payment = await prisma.mitraPayment.findUnique({
      where: { invoiceNumber: payment_id }
    })

    if (!payment || payment.status !== "paid") {
      return NextResponse.json(
        { error: "Pembayaran belum dikonfirmasi" },
        { status: 402 }
      )
    }

    // Cek apakah email sudah terdaftar
    const existing = await prisma.mitra.findUnique({
      where: { picEmail: pic_email }
    })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar sebagai mitra" },
        { status: 409 }
      )
    }

    const mitra = await prisma.mitra.create({
      data: {
        mitraId: `MITRA-${Date.now()}`,
        picName: pic_name,
        picEmail: pic_email,
        picPhone: pic_phone,
        picPosition: pic_position,
        picKtp: pic_ktp ?? null,
        companyName: company_name,
        companyType: company_type,
        companyNpwp: company_npwp ?? null,
        companyAddress: company_address,
        companyCity: company_city,
        companyProvince: company_province ?? null,
        companyPostal: company_postal ?? null,
        companyWebsite: company_website ?? null,
        employeeCount: employee_count ?? null,
        plan,
        planPrice: PLAN_PRICES[plan] ?? 0,
        paymentId: payment_id,
        status: "active",
        activatedAt: new Date()
      }
    })

    // Link payment ke mitra ID
    await prisma.mitraPayment.update({
      where: { invoiceNumber: payment_id },
      data: { mitraId: mitra.id }
    })

    return NextResponse.json({
      mitra_id: mitra.id,
      mitra_code: mitra.mitraId,
      status: mitra.status
    })
  } catch (err) {
    console.error("[mitra/register] error:", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
