// app/api/upload/ktp/route.ts

import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      )
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP" },
        { status: 400 }
      )
    }

    // Validasi ukuran file (maks 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB" },
        { status: 400 }
      )
    }

    // Konversi File ke Buffer lalu ke Base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64String = buffer.toString("base64")
    const dataUri = `data:${file.type};base64,${base64String}`

    // Upload ke Cloudinary pakai base64 — hemat memori, tidak perlu simpan file sementara
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "inventory/ktp",
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET!,
      resource_type: "image",
      // Transformasi: kompres + resize supaya tidak memakan storage berlebih
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, // batasi ukuran max
        { quality: "auto:good" }, // kompres otomatis
        { fetch_format: "auto" } // format terbaik (webp di browser modern)
      ],
      // Nama file unik berdasarkan timestamp
      public_id: `ktp_${Date.now()}`
    })

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Upload KTP error:", error)
    return NextResponse.json(
      { error: "Gagal mengupload gambar" },
      { status: 500 }
    )
  }
}
