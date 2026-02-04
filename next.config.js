const { PHASE_PRODUCTION_BUILD } = require('next/constants');

module.exports = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig.images.remotePatterns} */
  var remotePatterns;

  // nextjs is converting the environment variables to static strings during build,
  // this setup is used to be able to replace the static strings back into variables
  // that can be set in runtime.
  // Also set a default value when running unit tests so no need to manually config the process.env.RUNTIME_LITIUM_SERVER_URL
  if (phase == PHASE_PRODUCTION_BUILD || process.env.NODE_ENV === 'test') {
    process.env.RUNTIME_LITIUM_SERVER_URL =
      process.env.BUILD_LITIUM_SERVER_URL ??
      'https://litium-server-url.localtest.me';
    process.env.RUNTIME_IMAGE_SERVER_URL =
      process.env.BUILD_IMAGE_SERVER_URL ??
      'https://image-server-url.localtest.me';
  }

  const serverName = process.env.RUNTIME_LITIUM_SERVER_URL;
  const publicServer = serverName?.split('://');
  if (publicServer?.length != 2) {
    throw (
      "'RUNTIME_LITIUM_SERVER_URL' need to be set to domain name including schema, example 'RUNTIME_LITIUM_SERVER_URL=https://litium.localtest.me:5001' in .env file, current value " +
      serverName +
      '.'
    );
  }

  if (serverName[serverName.length - 1] == '/') {
    process.env.RUNTIME_LITIUM_SERVER_URL = serverName.substring(
      0,
      serverName.length - 1
    );
  }

  const serverUrl = new URL(process.env.RUNTIME_LITIUM_SERVER_URL);
  remotePatterns = [
    {
      protocol: serverUrl.protocol.substring(0, serverUrl.protocol.length - 1),
      hostname: serverUrl.hostname,
    },
    {
      protocol: 'https',
      hostname: 'localhost',
    },
  ];

  if (process.env.RUNTIME_IMAGE_SERVER_URL) {
    console.log(
      'Configure RUNTIME_IMAGE_SERVER_URL',
      process.env.RUNTIME_IMAGE_SERVER_URL
    );
    const imageServerUrl = new URL(process.env.RUNTIME_IMAGE_SERVER_URL);
    remotePatterns.push({
      protocol: imageServerUrl.protocol.substring(
        0,
        imageServerUrl.protocol.length - 1
      ),
      hostname: imageServerUrl.hostname,
    });
  }

  const runningInLitiumCloud = process.env.RUNNING_IN_LITIUM_CLOUD === 'true';
  const useCloudImageOptimization =
    runningInLitiumCloud &&
    process.env.LITIUM_CLOUD_IMAGE_OPTIMIZATION !== 'false';

  if (runningInLitiumCloud) {
    if (useCloudImageOptimization) {
      console.log('Running in litium cloud with image optimization.');
    } else {
      console.log('Running in litium cloud.');
    }
  }

  /** @type {import('next').NextConfig.images} */
  const images = {
    remotePatterns,
    ...(useCloudImageOptimization
      ? {
          loader: 'custom',
          loaderFile: './litium-cloud-image-loader.ts',
        }
      : null),
  };

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
    images: images,
    compiler: {
      removeConsole:
        process.env.NODE_ENV === 'production' &&
        process.env.INCLUDE_CONSOLE_LOGGING !== 'true',
      reactRemoveProperties: process.env.NODE_ENV === 'production',
    },
    // https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
    allowedDevOrigins: ['*.localtest.me', 'localhost'],
    output: 'standalone',
    poweredByHeader: false,
    experimental: {
      staleTimes: {
        dynamic: 0,
      },
    },
    async headers() {
      const commonItems = [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ];

      if (process.env.NODE_ENV === 'development') {
        commonItems.push({
          key: 'Strict-Transport-Security',
          value: 'max-age=600; preload',
        });
      }

      const nonPreviewItems = [
        {
          // The X-Frame-Options cant be used together with the preview due to cross-domain requests.
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
      ];

      return [
        {
          source: '/(.*)',
          headers: commonItems,
        },
        {
          source: '/((?!!).*)',
          headers: nonPreviewItems,
        },
      ];
    },
  };

  return nextConfig;
};
