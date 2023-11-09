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

  // webpack: (config) => {
  //   config.resolve.fallback = { 
  //     fs: require.resolve('browserify-fs'), //false 
  //     // child_process: false,
  //   };

  //   return config;
  // },
}

module.exports = nextConfig
