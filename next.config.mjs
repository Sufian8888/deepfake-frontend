/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: new URL('.', import.meta.url).pathname,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
