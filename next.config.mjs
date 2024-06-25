/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "terrific-ibis-759.convex.cloud",
            pathname: "/api/storage/**",
          },
        ],
      },
};

export default nextConfig;
