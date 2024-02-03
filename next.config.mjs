/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    domains: ["cdn.routescan.io"],
  },
};

export default nextConfig;
