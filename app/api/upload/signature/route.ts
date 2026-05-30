import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file)
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      )

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: "signatures",
      resource_type: "image"
    })

    return NextResponse.json({ success: true, url: result.secure_url })
  } catch (error) {
    console.error("Signature upload error:", error)
    return NextResponse.json(
      { error: "Gagal mengupload tanda tangan" },
      { status: 500 }
    )
  }
}
