import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
    "pdf-parse",
    "pdfjs-dist",
  ],
};

export default nextConfig;
