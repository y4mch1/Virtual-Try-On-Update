// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com'], // Allow Firebase Storage images
  },
  eslint: {
    ignoreDuringBuilds: true, // 
  },
};
