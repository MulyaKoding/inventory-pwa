import { NextRequest, NextResponse } from "next/server"

const BASE = "https://api.klinikme.com/api/v1"
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZF9QZWdhd2FpIjoiMzEwMDAwNTAwMSIsIkVuYWJsZVBpdXRhbmciOmZhbHNlLCJFbmFibGVLbGFpbUFzdXJhbnNpIjpmYWxzZSwiSXNOZXdMb29rS29yZWEiOmZhbHNlLCJJc0JhY2tkYXRlIjpmYWxzZSwiTmFtYUxlbmdrYXAiOiJWZWxvdXIgQWVzdGhldGljIENsaW5pYyIsIk5hbWFQZWdhd2FpIjoiVmVsb3VyIEFlc3RoZXRpYyBDbGluaWMiLCJEYWZ0YXJLZF9QcmFrdGVrQmVyc2FtYSI6W10sIk1lbWJlclByYWt0ZWtCZXJzYW1hIjpbXSwiVXNlcm5hbWUiOiJrbGluaWttZWtlY2FudGlrYW4iLCJFbWFpbCI6ImtsaW5pa3NheWFAeW9wbWFpbC5jb20iLCJLZF9LbGluaWsiOiIzMTAwMDA1IiwiSXNOZXdMb29rIjpmYWxzZSwiSXNEYWxpbGEiOmZhbHNlLCJJc1BlbGl0YUluc2FuaSI6ZmFsc2UsIklzTWVkaXNhIjpmYWxzZSwiSXNBZXJpIjpmYWxzZSwiTmFtYUtsaW5payI6IktsaW5pa01lIEtlY2FudGlrYW4iLCJKZW5pc0tsaW5payI6IktsaW5payBQcmF0YW1hIiwiS2F0ZWdvcmlLbGluaWsiOiJLbGluaWsgS2VjYW50aWthbiIsIkxpc3RLYXRlZ29yaUtsaW5payI6W10sIkphYmF0YW4iOiJVc2VyQWRtaW4iLCJTdGF0dXNHcnVwIjoiTm9uIEdydXAiLCJJZF9QZXJ1c2FoYWFuIjpudWxsLCJUaXBlR3J1cCI6IlB1c2F0IiwiTGlzdEZpdHVyIjpbIkJPT0tJTkc6Qm9va2luZyIsIkFOVFJJQU46QW50cmlhbiIsIkRBU0hCT0FSRDpEYXNoYm9hcmQiLCJSRUdJU1RSQVNJOlJlZ2lzdHJhc2kiLCJSRUtBTU1FRElTOktlY2FudGlrYW4iLCJCSUxMSU5HOlBhc2llbi1BcG90aWsiLCJSVUpVS0FOOlJ1anVrYW4iLCJGQVJNQVNJOk1hc3Rlci1QZW1hc3VrYW4tUGVuZ2VsdWFyYW4tU3Rvay1SZXR1ci1QZW55ZXN1YWlhbi1QZW5lcmltYWFuIiwiS0VVQU5HQU46S2V1YW5nYW4iLCJMQVBPUkFOOkxhcG9yYW4iLCJQRU5HQVRVUkFOOktsaW5pay1Ba3VuLVBlbGF5YW5hbi1KYWR3YWwtUGVnYXdhaSJdLCJMaXN0RmVlIjp7IkthdGVnb3JpRmVlIjoiQiIsIkZlZVBlbGF5YW5hbiI6MTIwMDAsIkZlZUJhd2FoUGVsYXlhbmFuIjoxMDAwLCJUeXBlRmVlUGVsYXlhbmFuIjoiRXhjbHVkZSIsIkZlZU9iYXQiOjUsIlR5cGVGZWVPYmF0IjoiSW5jbHVkZSIsIkZlZUJhcmFuZyI6NSwiVHlwZUZlZUJhcmFuZyI6IkluY2x1ZGUiLCJGZWVQcm9kdWsiOjUsIlR5cGVGZWVQcm9kdWsiOiJJbmNsdWRlIn0sIkxpc3RQZW1iYXlhcmFuIjpbeyJLZF9HcnVwUGFzaWVuIjoiMDEiLCJKZW5pc1Bhc2llbiI6IlVtdW0ifSx7IktkX0dydXBQYXNpZW4iOiIwMiIsIkplbmlzUGFzaWVuIjoiQlBKUyJ9XSwiQ2FiYW5nS2xpbmlrIjpudWxsLCJJc0tlbWVudGVyaWFuQVRSIjpmYWxzZSwiSXNLaW9sYSI6ZmFsc2UsIklzSEtsaW5payI6dHJ1ZSwiSXNBdmlkYSI6ZmFsc2UsIklzS3VpdGFuc2kiOmZhbHNlLCJJc0t1aXRhbnNpR2lnaSI6ZmFsc2UsIklzS3VpdGFuc2lHaWdpRGV0YWlsIjpmYWxzZSwiSXNBaW5vb3IiOmZhbHNlLCJJc1ZlcmVubmEiOmZhbHNlLCJJc0ltYWdlU3VyYXRTZWhhdCI6ZmFsc2UsIklzVGluZGFrYW5TS1AiOmZhbHNlLCJJc0JwanMiOnRydWUsIklzUHJvIjpmYWxzZSwiSXNEYXNoYm9hcmRBbnRyaWFuIjp0cnVlLCJJc0tlbWVudGFuIjpmYWxzZSwiSXNBbGxEaWFnbm9zYSI6ZmFsc2UsIklzQmlydGhkYXkiOmZhbHNlLCJJc05vUmVnaXN0YXNpU3VyYXQiOmZhbHNlLCJJc0hhaWZmYSI6ZmFsc2UsIklzQmlsbGluZ1dpdGhOb1JlZ2lzdHJhc2kiOmZhbHNlLCJDVVNUT01fUHJpbnRfUGVyaWtzYUtlY2FudGlrYW4iOnRydWUsIklzSmFuamlLbGluaWsiOmZhbHNlLCJJc0xhcG9yYW5UcmFuc2Frc2lMZW5na2FwIjpmYWxzZSwiSXNLYWppYW5SZXNlcCI6dHJ1ZSwiSXNBbmF0b21pVHVidWgiOmZhbHNlLCJJc0FsYW1hdFBhc2llbkxhbWEiOmZhbHNlLCJJc0tsaW5pa1VOSiI6ZmFsc2UsIkNVU1RPTV9LTEhLIjpmYWxzZSwiQUREX09OX1JlZ0xhcG9yYW5fUGVyYXdhdCI6ZmFsc2UsIktkX0Fwb3RpayI6IjMxMDAwMDVBUEswMDEiLCJJZF9Mb2dMb2dpbiI6IjMxMDAwMDVMTDcxODI0IiwiaWF0IjoxNzc1NzkyNDkxLCJleHAiOjE3NzU4Nzg4OTF9.CJ3O4kP-E9_XCtZpBgL-TRsGmSzfnTSy3JWXKBjuVRs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  let url = ""

  if (type === "provinsi") {
    url = `${BASE}/data_provinsi`
  } else if (type === "kota") {
    const provinsi = searchParams.get("provinsi")
    if (!provinsi)
      return NextResponse.json({ error: "provinsi required" }, { status: 400 })
    url = `${BASE}/data_kota?provinsi=${provinsi}`
  } else if (type === "kecamatan") {
    const kota = searchParams.get("kota")
    if (!kota)
      return NextResponse.json({ error: "kota required" }, { status: 400 })
    url = `${BASE}/data_kecamatan?kota=${kota}`
  } else if (type === "kelurahan") {
    const kecamatan = searchParams.get("kecamatan")
    if (!kecamatan)
      return NextResponse.json({ error: "kecamatan required" }, { status: 400 })
    url = `${BASE}/data_kelurahan?kecamatan=${kecamatan}`
  } else {
    return NextResponse.json({ error: "type tidak valid" }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
        Authorization: TOKEN // ← fix utama: tambah Authorization header
      },
      next: {
        revalidate: type === "provinsi" || type === "kota" ? 3600 : 300
      }
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Normalisasi response — pastikan selalu return { data: [] }
    // API klinikme return { status, message, data: [...] }
    return NextResponse.json(
      { data: data.data ?? data ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    )
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghubungi server wilayah" },
      { status: 500 }
    )
  }
}
