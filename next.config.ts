// // next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ["https://lh3.googleusercontent.com"],
//     // remotePatterns: [new URL( "https://lh3.googleusercontent.com/**")],
//   },
// };

// module.exports = nextConfig;

// next.config.js (or next.config.ts)

/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'jigzexplorer.quest',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
