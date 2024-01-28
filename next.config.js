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

  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },

  externals: {
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },

}

module.exports = nextConfig
