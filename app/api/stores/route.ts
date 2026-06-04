import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

function generateStoreId(userId: string): string {
  const prefix = "STR"
  const userSuffix = userId.slice(-4).toUpperCase()
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${userSuffix}-${timestamp}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      storeName,
      storeType,
      storePhone,
      storeEmail,
      storeAddress,
      storeCity,
      storeProvince,
      storePostalCode,
      storeDistrict,
      storeVillage,
      storeProvinsiKd,
      storeKotaKd,
      storeKecamatanKd,
      storeKelurahanKd,
      storeLat,
      storeLng,
      owner
    } = body

    if (
      !storeName ||
      !storeType ||
      !storePhone ||
      !storeAddress ||
      !storeCity ||
      !storeProvince
    ) {
      return NextResponse.json(
        { error: "Data toko tidak lengkap" },
        { status: 400 }
      )
    }

    if (
      !owner ||
      !owner.nik ||
      !owner.fullName ||
      !owner.birthDate ||
      !owner.address ||
      !owner.gender
    ) {
      return NextResponse.json(
        { error: "Data pemilik tidak lengkap" },
        { status: 400 }
      )
    }

    if (owner.nik.length !== 16 || !/^\d+$/.test(owner.nik)) {
      return NextResponse.json(
        { error: "NIK harus 16 digit angka" },
        { status: 400 }
      )
    }

    const storeId = generateStoreId(user.userId)

    const store = await prisma.store.create({
      data: {
        storeId,
        userId: user.userId, // ← dari token
        storeName,
        storeType,
        storePhone,
        storeEmail: storeEmail || null,
        storeAddress,
        storeCity,
        storeDistrict: storeDistrict || null,
        storeVillage: storeVillage || null,
        storeProvince,
        storePostalCode: storePostalCode || null,
        storeProvinsiKd: storeProvinsiKd || null,
        storeKotaKd: storeKotaKd || null,
        storeKecamatanKd: storeKecamatanKd || null,
        storeKelurahanKd: storeKelurahanKd || null,
        storeLat: storeLat || null,
        storeLng: storeLng || null,
        storeImageUrl: body.storeImageUrl ?? null,
        status: "active",
        owner: {
          nik: owner.nik,
          fullName: owner.fullName,
          birthDate: owner.birthDate,
          address: owner.address,
          gender: owner.gender,
          ktpImageUrl: owner.ktpImageUrl || null,
          inputMethod: owner.inputMethod || "manual",
          signatureUrl: body.owner.signatureUrl ?? null
        }
      }
    })

    return NextResponse.json(
      { success: true, message: "Toko berhasil didaftarkan", data: store },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("Error creating store:", error)
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan server"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stores = await prisma.store.findMany({
      where: { userId: user.userId }, // ← hanya toko milik user ini
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
