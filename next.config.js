/** @type {import('next').NextConfig} */
const nextConfig = {
    //NOTE: Usually empty by default.
    // redirect default landing page to routable home directory
    async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
