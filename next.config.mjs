/** @type {import('next').NextConfig} */
const nextConfig = {
  // bcrypt is a native module, so keep it out of the bundler
  experimental: { serverComponentsExternalPackages: ['bcrypt'] },
};
export default nextConfig;
