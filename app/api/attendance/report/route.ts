import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date") // "YYYY-MM-DD"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let where: any = {}

    if (date) {
      where.date = date
    } else if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate }
    } else {
      // default: hari ini
      where.date = new Date().toISOString().split("T")[0]
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            name: true,
            employeeCode: true,
            position: true,
            photoUrl: true
          }
        }
      },
      orderBy: [{ date: "desc" }, { clockIn: "desc" }]
    })

    // Jika filter per tanggal tunggal, sertakan juga karyawan yang belum absen sama sekali
    let absentEmployees: any[] = []
    if (date) {
      const allEmployees = await prisma.employee.findMany({
        where: { status: "active" },
        select: {
          id: true,
          name: true,
          employeeCode: true,
          position: true,
          photoUrl: true
        }
      })
      const presentIds = new Set(attendances.map((a) => a.employeeId))
      absentEmployees = allEmployees.filter((e) => !presentIds.has(e.id))
    }

    return NextResponse.json({
      data: attendances,
      absentEmployees
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Gagal mengambil data rekap" },
      { status: 500 }
    )
  }
}
