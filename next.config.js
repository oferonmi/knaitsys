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
        source: "/:path*", ///api/:path*",
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

  // Override the default webpack configuration
  webpack: (config, { isServer }) => {
      // See https://webpack.js.org/configuration/resolve/#resolvealias
      config.resolve.alias = {
          ...config.resolve.alias,
          "sharp$": false,
          "onnxruntime-node$": false,
      }

      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
        asyncWebAssembly: true,
      };

      config.module.rules.push({
        test: /\.md$/i,
        use: "raw-loader",
      });

      // Fixes npm packages that depend on `fs` module
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
            // by next.js will be dropped. Doesn't make much sense, but how it is
          fs: false, // the solution
          "node:fs/promises": false,
          module: false,
          perf_hooks: false,
        };
      }

      // config.externals["node:fs"] = "commonjs node:fs";
      // config.externals.push({ vectordb: 'vectordb' });

      return config;
  },
};

module.exports = nextConfig;
