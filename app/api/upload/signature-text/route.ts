import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function POST(req: NextRequest) {
  try {
    const { text, fontFamily, fontSize } = await req.json()

    if (!text)
      return NextResponse.json({ error: "Teks kosong" }, { status: 400 })

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
      <rect width="800" height="200" fill="white"/>
      <text
        x="400" y="110"
        font-family="${fontFamily}, Georgia, serif"
        font-size="${fontSize || 84}"
        fill="#111111"
        text-anchor="middle"
        dominant-baseline="middle"
        font-style="italic"
      >${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
    </svg>`

    const base64Svg = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

    const result = await cloudinary.uploader.upload(base64Svg, {
      folder: "signatures",
      resource_type: "image",
      transformation: [{ width: 800, height: 200, crop: "fit" }]
    })

    return NextResponse.json({ success: true, url: result.secure_url })
  } catch (error) {
    console.error("Signature text upload error:", error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: "Gagal upload", detail: msg },
      { status: 500 }
    )
  }
}
