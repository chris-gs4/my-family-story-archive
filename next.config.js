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
        // Local dev IP for Capacitor live reload
        '192.168.50.202:3000',
        '192.168.50.202',
      ],
    },
  },
}

module.exports = nextConfig
