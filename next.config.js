/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Development only: lets a phone on the same Wi-Fi load the dev server at the Mac's local address
  // (http://192.168.1.11:3000). Update it if the router hands the Mac a different address.
  allowedDevOrigins: ['192.168.1.11'],
};

module.exports = nextConfig;
