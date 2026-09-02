import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds; keep linting during dev and CI
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r9q9iiavth.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "newbalance.ch",
        port: "",
        pathname: "/cdn/shop/files/**",
      },
      {
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Enable WebAssembly experiments so Prisma's generated .wasm can be processed
  webpack: (config, {isServer}) => {
    // Enable async WebAssembly experiments
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
    };

    // Ensure .wasm files are treated as async WebAssembly modules
    if (!config.module) config.module = {rules: []};
    config.module.rules.push({
      test: /\.wasm$/i,
      type: "webassembly/async",
    });

    return config;
  },
};

export default nextConfig;
