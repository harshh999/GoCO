/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3", "better-sqlite3"],
  },
};

export default nextConfig;
