/** @type {import('next').NextConfig} */
const nextConfig = {
    //NOTE: Usually empty by default.
    // output: 'export',

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

  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://api.example.com/:path*',
  //     },
  //   ]
  // },

  // webpack: (config) => {
  //   config.resolve.fallback = { 
  //     fs: require.resolve('browserify-fs'), //false 
  //     // child_process: false,
  //   };
  //   return config;
  // },

  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.resolve.fallback = { fs: false };
    return config;
  },

  // externals: {
  //   bufferutil: 'bufferutil',
  //   'utf-8-validate': 'utf-8-validate',
  // },

}

module.exports = nextConfig
