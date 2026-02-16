/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        // Capacitor iOS uses capacitor://localhost as its origin
        'capacitor://localhost',
        'localhost',
      ],
    },
  },
}

module.exports = nextConfig
