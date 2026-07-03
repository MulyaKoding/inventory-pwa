import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

// GET → ambil semua karyawan + descriptor (untuk matching di client)
export async function GET() {
  const employees = await prisma.employee.findMany({
    where: { status: "active" },
    select: {
      id: true,
      employeeCode: true,
      name: true,
      position: true,
      faceDescriptor: true,
      photoUrl: true
    }
  })
  return NextResponse.json({ data: employees })
}

// POST → daftarkan wajah karyawan baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      employeeCode,
      name,
      email,
      phone,
      position,
      storeId,
      faceDescriptor,
      photoUrl
    } = body

    if (
      !name ||
      !faceDescriptor ||
      !Array.isArray(faceDescriptor) ||
      faceDescriptor.length !== 128
    ) {
      return NextResponse.json(
        {
          error:
            "Data wajah tidak valid. Pastikan wajah terdeteksi dengan jelas."
        },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode: employeeCode || `EMP-${Date.now()}`,
        name,
        email: email || undefined,
        phone: phone || undefined,
        position: position || undefined,
        storeId: storeId || undefined,
        faceDescriptor,
        photoUrl: photoUrl || undefined
      }
    })

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Email/kode karyawan sudah terdaftar" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Gagal menyimpan data karyawan" },
      { status: 500 }
    )
  }
}
