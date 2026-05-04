export function extractPublicId(url: string): string | null {
  if (!url) return null

  try {
    // Split di "/upload/"
    const uploadIndex = url.indexOf("/upload/")
    if (uploadIndex === -1) return null

    const afterUpload = url.slice(uploadIndex + "/upload/".length)

    // Hapus version prefix jika ada (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, "")

    // Hapus ekstensi file
    const withoutExt = withoutVersion.replace(/\.[^/.]+$/, "")

    return withoutExt || null
  } catch {
    return null
  }
}
