import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { getUserFromRequest } from "@/app/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const store = await prisma.store.findFirst({
      where: { id, userId: user.userId }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      )
    }

    const {
      storeName,
      storeType,
      storePhone,
      storeEmail,
      storeAddress,
      storeImageUrl,
      storeProvince,
      storeCity,
      storeDistrict,
      storeVillage,
      storePostalCode,
      storeProvinsiKd,
      storeKotaKd,
      storeKecamatanKd,
      storeKelurahanKd,
      owner
    } = body

    const updated = await prisma.store.update({
      where: { id },
      data: {
        ...(storeName !== undefined && { storeName }),
        ...(storeType !== undefined && { storeType }),
        ...(storePhone !== undefined && { storePhone }),
        ...(storeEmail !== undefined && { storeEmail }),
        ...(storeAddress !== undefined && { storeAddress }),
        ...(storeImageUrl !== undefined && { storeImageUrl }),
        ...(storeProvince !== undefined && { storeProvince }),
        ...(storeCity !== undefined && { storeCity }),
        ...(storeDistrict !== undefined && { storeDistrict }),
        ...(storeVillage !== undefined && { storeVillage }),
        ...(storePostalCode !== undefined && { storePostalCode }),
        ...(storeProvinsiKd !== undefined && { storeProvinsiKd }),
        ...(storeKotaKd !== undefined && { storeKotaKd }),
        ...(storeKecamatanKd !== undefined && { storeKecamatanKd }),
        ...(storeKelurahanKd !== undefined && { storeKelurahanKd }),
        ...(owner !== undefined && {
          owner: {
            nik: owner.nik ?? store.owner?.nik ?? "",
            fullName: owner.fullName ?? store.owner?.fullName ?? "",
            birthDate: owner.birthDate ?? store.owner?.birthDate ?? "",
            address: owner.address ?? store.owner?.address ?? "",
            gender: owner.gender ?? store.owner?.gender ?? "",
            ktpImageUrl: owner.ktpImageUrl ?? store.owner?.ktpImageUrl ?? null,
            signatureUrl:
              owner.signatureUrl ?? store.owner?.signatureUrl ?? null,
            inputMethod: store.owner?.inputMethod ?? "manual"
          }
        })
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const store = await prisma.store.findFirst({
      where: { id, userId: user.userId }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan atau bukan milik Anda" },
        { status: 404 }
      )
    }

    await prisma.store.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Toko berhasil dihapus"
    })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
