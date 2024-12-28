/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  
  // Environment variable configuration
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://loadedteaclub.com',
    NEXT_PUBLIC_APP_NAME: 'Loaded Tea Club'
  },

  // Webpack configuration
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        'fs/promises': false,
        'timers/promises': false,
        dns: false,
        crypto: false,
        'util/types': false,
        child_process: false
      };

      // Ignore unnecessary binary modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/Release\/.*/,
          contextRegExp: /mongodb-client-encryption|@mongodb-js\/zstd|kerberos|snappy/
        })
      );
    }

    // Ignore Sentry instrumentation warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@prisma\/instrumentation/ },
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
      { module: /node_modules\/@sentry/ }
    ];

    // Minimize bundle size
    config.optimization.minimize = true;
    
    return config;
  },
  
  // Experimental Features
  experimental: {
    // Optimize server-side rendering
    serverComponentsExternalPackages: [
      'mongodb-client-encryption',
      '@mongodb-js/zstd',
      'kerberos',
      'snappy'
    ],
    
    // Performance optimizations
    optimizeCss: true,
    optimizeServerReact: true,
    serverMinification: true,
    instrumentationHook: true
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data:; connect-src *;"
          }
        ]
      }
    ];
  },
  
  // Image optimization
  images: {
    domains: ['loadedteaclub.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

// Sentry configuration
module.exports = withSentryConfig(
  nextConfig, 
  {
    silent: true,
    org: 'loadedteaclub',
    project: 'web-app'
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitoring: true
  }
);
