import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("ktp") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "File KTP tidak ditemukan" },
        { status: 400 }
      )
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP." },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const mimeType = file.type

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.8-27b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            },
            {
              type: "text",
              text: `Ekstrak data dari KTP (Kartu Tanda Penduduk) Indonesia ini.
                Kembalikan HANYA JSON dengan format berikut (tanpa markdown, tanpa penjelasan):
                {"nik":"string 16 digit","fullName":"nama lengkap","birthDate":"DD-MM-YYYY","address":"alamat lengkap RT/RW Kel/Desa Kecamatan","gender":"Laki-laki atau Perempuan"}
                Jika field tidak dapat dibaca, isi dengan string kosong "".
                Pastikan NIK hanya berisi 16 angka, tanpa spasi atau karakter lain.`
            }
          ]
        }
      ],
      max_tokens: 1024
    })

    const text = response.choices[0]?.message?.content || ""

    let ktpData
    try {
      const cleanJson = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      ktpData = JSON.parse(cleanJson)
    } catch {
      return NextResponse.json(
        {
          error:
            "Gagal memproses data KTP. Pastikan gambar KTP jelas dan tidak blur."
        },
        { status: 422 }
      )
    }

    if (!ktpData.nik && !ktpData.fullName) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat mendeteksi data KTP. Pastikan gambar adalah KTP yang valid."
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ success: true, data: ktpData })
  } catch (error) {
    console.error("OCR Error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses KTP" },
      { status: 500 }
    )
  }
}
