import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!
})

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { publicId } = body

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { error: "publicId wajib diisi" },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true
    })

    // "not found" dianggap sukses — file mungkin sudah terhapus sebelumnya
    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary: ${result.result}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result: result.result,
      publicId
    })
  } catch (error) {
    console.error("Delete Cloudinary error:", error)
    const errMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Gagal menghapus gambar", detail: errMsg },
      { status: 500 }
    )
  }
}
