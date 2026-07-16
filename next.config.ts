import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://api.anthropic.com",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["sharp"],
  async redirects() {
    return [
      { source: "/try", destination: "/roboprompt/try", permanent: false },
      { source: "/about", destination: "/roboprompt/about", permanent: false },
      { source: "/diary", destination: "/roboprompt/diary", permanent: false },
      { source: "/members", destination: "/roboprompt/members", permanent: false },
      { source: "/members/:slug", destination: "/roboprompt/members/:slug", permanent: false },
      { source: "/simulator", destination: "/ftc/simulator", permanent: false },
      { source: "/coach", destination: "/ftc/coach", permanent: false },
      { source: "/student", destination: "/ftc/student", permanent: false },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
