"use client"

import { useEffect, useState } from "react"

type AttendanceRecord = {
  id: string
  date: string
  clockIn: string | null
  clockOut: string | null
  clockInScore: number | null
  clockOutScore: number | null
  status: string
  employee: {
    name: string
    employeeCode: string
    position: string | null
    photoUrl: string | null
  }
}

type AbsentEmployee = {
  id: string
  name: string
  employeeCode: string
  position: string | null
  photoUrl: string | null
}

function todayString() {
  return new Date().toISOString().split("T")[0]
}

function formatTime(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

function formatDuration(clockIn: string | null, clockOut: string | null) {
  if (!clockIn || !clockOut) return "—"
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime()
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}j ${minutes}m`
}

export default function AttendanceReportPage() {
  const [date, setDate] = useState(todayString())
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [absent, setAbsent] = useState<AbsentEmployee[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReport = async (selectedDate: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance/report?date=${selectedDate}`)
      const json = await res.json()
      setRecords(json.data || [])
      setAbsent(json.absentEmployees || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport(date)
  }, [date])

  const totalHadir = records.length
  const totalTelat = records.filter((r) => r.status === "late").length
  const totalBelumAbsen = absent.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Rekap Absensi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Riwayat kehadiran karyawan harian
            </p>
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 [&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Hadir</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalHadir}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Terlambat
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {totalTelat}
            </p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum Absen
            </p>
            <p className="text-2xl font-bold text-slate-400 dark:text-slate-500 mt-1">
              {totalBelumAbsen}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabel hadir */}
            <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Sudah Absen ({totalHadir})
                </h2>
              </div>

              {records.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Belum ada yang absen pada tanggal ini
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-2.5 font-medium">Karyawan</th>
                        <th className="px-4 py-2.5 font-medium">Clock In</th>
                        <th className="px-4 py-2.5 font-medium">Clock Out</th>
                        <th className="px-4 py-2.5 font-medium">Durasi</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {r.employee.photoUrl ? (
                                <img
                                  src={r.employee.photoUrl}
                                  alt={r.employee.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500">
                                  {r.employee.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-100">
                                  {r.employee.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {r.employee.position ||
                                    r.employee.employeeCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {formatTime(r.clockIn)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {formatTime(r.clockOut)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {formatDuration(r.clockIn, r.clockOut)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                r.status === "late"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              }`}
                            >
                              {r.status === "late"
                                ? "Terlambat"
                                : "Tepat Waktu"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Belum absen */}
            {absent.length > 0 && (
              <div className="rounded-xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Belum Absen ({absent.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {absent.map((e) => (
                    <div
                      key={e.id}
                      className="px-4 py-3 flex items-center gap-3"
                    >
                      {e.photoUrl ? (
                        <img
                          src={e.photoUrl}
                          alt={e.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-500">
                          {e.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {e.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {e.position || e.employeeCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
