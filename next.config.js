/** @type {import('next').NextConfig} */
const nextConfig = {

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

	images: {
		domains: [
			'avatars.githubusercontent.com',
		],
	},

	// Override the default webpack configuration
	webpack: (config, { isServer }) => {
		// See https://webpack.js.org/configuration/resolve/#resolvealias
		config.resolve.alias = {
			...config.resolve.alias,
			"sharp$": false,
			"onnxruntime-node$": false
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
				...config.resolve.fallback,
				fs: false,
				"node:fs/promises": false,
				module: false,
				perf_hooks: false,
			};
		}
		
		// disable webpack caching
		config.cache = false;

		config.externals = [...(config.externals || []), { canvas: 'canvas' }];

		return config;
	},
};

module.exports = nextConfig;
