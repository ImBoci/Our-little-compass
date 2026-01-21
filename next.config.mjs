/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we are using the correct key for Next.js 16/Turbopack compatibility
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@prisma/adapter-libsql"
  ],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader',
    });
    return config;
  },
};
export default nextConfig;