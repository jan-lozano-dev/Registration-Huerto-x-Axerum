import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking (embedding the site in iframes)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing attacks
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limit referrer info sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable access to sensitive browser APIs
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Restrict resource origins — Next.js requires unsafe-inline for hydration scripts
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self';" },
        ],
      },
    ];
  },
};

export default nextConfig;
