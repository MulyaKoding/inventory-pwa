import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/app/generated/prisma"

const prisma = new PrismaClient()

function todayString() {
  const d = new Date()
  return d.toISOString().split("T")[0] // "YYYY-MM-DD"
}

// POST → proses absen (otomatis deteksi clock in / clock out)
export async function POST(req: NextRequest) {
  try {
    const { employeeId, matchScore } = await req.json()
    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId wajib diisi" },
        { status: 400 }
      )
    }

    const date = todayString()
    const now = new Date()

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date } }
    })

    // Belum absen sama sekali hari ini → Clock In
    if (!existing) {
      const clockInLimit = new Date(now)
      clockInLimit.setHours(8, 0, 0, 0) // jam 08:00 standar

      const record = await prisma.attendance.create({
        data: {
          employeeId,
          date,
          clockIn: now,
          clockInScore: matchScore,
          status: now > clockInLimit ? "late" : "present"
        }
      })
      return NextResponse.json({ type: "clock_in", data: record })
    }

    // Sudah clock in, belum clock out → Clock Out
    if (existing.clockIn && !existing.clockOut) {
      const record = await prisma.attendance.update({
        where: { id: existing.id },
        data: { clockOut: now, clockOutScore: matchScore }
      })
      return NextResponse.json({ type: "clock_out", data: record })
    }

    // Sudah clock in & clock out → tolak, sudah selesai hari ini
    return NextResponse.json(
      {
        type: "already_done",
        message: "Anda sudah absen masuk & pulang hari ini"
      },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Gagal memproses absensi" },
      { status: 500 }
    )
  }
}

// GET → riwayat absen (opsional, buat rekap)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date") || todayString()

  const data = await prisma.attendance.findMany({
    where: { date },
    include: {
      employee: { select: { name: true, employeeCode: true, position: true } }
    },
    orderBy: { clockIn: "desc" }
  })

  return NextResponse.json({ data })
}
