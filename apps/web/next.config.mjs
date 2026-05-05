/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["drizzle-orm", "pg"],
  transpilePackages: ["@workspace/ui", "@workspace/auth"],
}

export default nextConfig
