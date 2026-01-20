/** @type {import('next').NextConfig} */
const nextConfig = {
  // New Next.js 15/16 location for external packages
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@prisma/adapter-libsql"
  ],
  // Keep this to stop the README.md errors
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig