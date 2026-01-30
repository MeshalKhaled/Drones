import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  experimental: {
    // R-156: Partial Prerendering - requires Next.js canary
    // Uncomment when upgrading to canary: ppr: 'incremental',
  },

  // Suppress "Critical dependency" warnings from Sentry/OpenTelemetry/Prisma
  // These are caused by dynamic imports in instrumentation packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore warnings from @prisma/instrumentation and @opentelemetry
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /@prisma\/instrumentation/,
        },
        {
          module: /@opentelemetry/,
        },
        {
          message: /Critical dependency: the request of a dependency is an expression/,
        },
      ];
    }
    return config;
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Only upload source maps in production
  silent: true,

  // Suppresses source map uploading logs during build
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Disable automatic instrumentation for server-side
  // This prevents the Prisma instrumentation from being loaded
  autoInstrumentServerFunctions: false,
};

// Build the config with optional wrappers
let config = nextConfig;

// Wrap with Sentry if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
  config = withSentryConfig(config, sentryWebpackPluginOptions);
}

// Wrap with bundle analyzer (enabled via ANALYZE=true)
config = withBundleAnalyzer(config);

export default config;
