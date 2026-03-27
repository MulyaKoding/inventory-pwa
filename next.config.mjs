import path from "path"
import { fileURLToPath } from "url"
import withPWA from "next-pwa"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname
  }
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
})(nextConfig)
