// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only initialize Sentry if DSN is provided
  enabled: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
  ],

  // Environment tag
  environment: process.env.NODE_ENV,

  // Disable Prisma instrumentation to avoid "Critical dependency" warnings
  // This project doesn't use Prisma
  integrations: (integrations) => {
    return integrations.filter(
      (integration) => integration.name !== "Prisma" && integration.name !== "PrismaInstrumentation"
    );
  },
});
