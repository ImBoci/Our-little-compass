/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Tell Next.js these packages are for the Server only.
  // This prevents it from trying to bundle them for the browser.
  experimental: {
    serverComponentsExternalPackages: [
      "@libsql/client", 
      "libsql", 
      "@prisma/adapter-libsql"
    ],
  },

  // 2. Safety Net: Tell Webpack "If you still see a .md file, ignore it."
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'ignore-loader',
    });
    return config;
  },
};

module.exports = nextConfig