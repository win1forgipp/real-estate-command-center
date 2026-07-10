import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
    // Next.js 15.5+ proxy can truncate multipart uploads unless this matches bodySizeLimit.
    // Types may lag behind the runtime option.
    ...({ proxyClientMaxBodySize: "25mb" } as Record<string, string>),
  },
};

export default nextConfig;
