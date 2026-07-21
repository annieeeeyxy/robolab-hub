import type { NextConfig } from "next";

function deploymentOrigin(name: "ROBOLAB_FTC_ORIGIN" | "ROBOPROMPT_ORIGIN", fallback: string) {
  const configured = process.env[name] || fallback;
  const url = new URL(configured);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production`);
  }
  return url.origin;
}

const ftcOrigin = deploymentOrigin("ROBOLAB_FTC_ORIGIN", "https://gcet-gold.vercel.app");
const promptOrigin = deploymentOrigin("ROBOPROMPT_ORIGIN", "https://robo-prompt.vercel.app");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/roboprompt", destination: "/prompt", permanent: true },
      { source: "/roboprompt/tutorial", destination: "/prompt", permanent: true },
      { source: "/roboprompt/members", destination: "/projects#team", permanent: true },
      { source: "/roboprompt/members/:slug", destination: "/projects#team", permanent: true },
      { source: "/roboprompt/:path+", destination: "/prompt/:path+", permanent: true },
      { source: "/ftc/intro", destination: "/ftc", permanent: true },
      { source: "/ftc/tutorial", destination: "/ftc/learn", permanent: true },
      { source: "/try", destination: "/prompt/try", permanent: false },
      { source: "/about", destination: "/prompt/about", permanent: false },
      { source: "/diary", destination: "/prompt/diary", permanent: false },
      { source: "/members", destination: "/projects#team", permanent: false },
      { source: "/members/:slug", destination: "/projects#team", permanent: false },
      { source: "/simulator", destination: "/ftc/simulator", permanent: false },
      { source: "/coach", destination: "/ftc/coach", permanent: false },
      { source: "/student", destination: "/ftc/student", permanent: false },
      { source: "/learn", destination: "/ftc/learn", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/ftc", destination: `${ftcOrigin}/ftc` },
      { source: "/ftc/:path+", destination: `${ftcOrigin}/ftc/:path+` },
      { source: "/prompt", destination: `${promptOrigin}/prompt` },
      { source: "/prompt/:path+", destination: `${promptOrigin}/prompt/:path+` },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/",
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
