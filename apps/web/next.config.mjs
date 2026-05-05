/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["drizzle-orm", "pg"],
  transpilePackages: ["@workspace/ui", "@workspace/auth"],
}

export default nextConfig
