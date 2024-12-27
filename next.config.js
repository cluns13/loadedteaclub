/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_NAME: 'Loaded Tea Club',
    NEXT_PUBLIC_SITE_URL: 'https://loadedteaclub.com'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        child_process: false
      };
    }
    return config;
  }
};

module.exports = nextConfig
