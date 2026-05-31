/** @type {import('next').NextConfig} */

// Lee el dominio de producción desde la variable de entorno
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const allowedOrigin = new URL(appUrl).host  // "localhost:3000" o "tudominio.com"

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", allowedOrigin].filter(Boolean),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
