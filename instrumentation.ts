export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./tooling/sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./tooling/sentry.edge.config");
  }
}
