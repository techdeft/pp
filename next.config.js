/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode temporarily to avoid double-rendering hydration issues
  reactStrictMode: false,
  // Suppress hydration warnings caused by browser extensions
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Add React configuration to suppress hydration warnings
  compiler: {
    styledComponents: true,
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
