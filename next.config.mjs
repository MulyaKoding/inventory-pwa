import path from "path"
import { fileURLToPath } from "url"
/** @type {import('next').NextConfig} */
import withPWA from "next-pwa"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "./app/generated/prisma",
    "../generated/prisma"
  ],
  turbopack: {
    root: __dirname,
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@prisma/client",
        /app\/generated\/prisma/
      ]
    }
    return config
  }
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
})(nextConfig)
