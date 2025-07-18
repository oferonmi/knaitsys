"use client";

import { signIn, getProviders } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { GoogleIcon, FacebookIcon, GitHubIcon, AppleIcon } from "@/components/Icons";
import type { ClientSafeProvider } from "next-auth/react";

interface LoginFormData {
	username: string;
	password: string;
}

const CALLBACK_URL = "/home";
const OAUTH_CALLBACK_URL = "/ai_tools";

const SocialLoginButton = ({
	provider,
	icon,
}: {
	provider: ClientSafeProvider;
	icon: React.ReactNode;
}) => (
	<button
		onClick={() => signIn(provider.id, { callbackUrl: OAUTH_CALLBACK_URL })}
		className="flex text-kaito-brand-ash-green justify-center items-center bg-white border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green hover:text-white focus:ring-1 focus:ring-kaito-brand-ash-green rounded-lg text-sm px-5 py-2 w-full focus:outline-none gap-2 shadow font-bold"
		aria-label={`Sign in with ${provider.name}`}
	>
		{icon} <span className="text-center font-bold">Sign in with {provider.name}</span>
	</button>
);

const Login = () => {
	const [formData, setFormData] = useState<LoginFormData>({
		username: "",
		password: "",
	});
	const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const setUpProviders = async () => {
			try {
				const response = await getProviders();
				setProviders(response);
			} catch (err) {
				setError("Failed to load authentication providers");
				console.error("Provider setup error:", err);
			}
		};
		setUpProviders();
	}, []);

	const handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
		const { id, value } = e.target;
		setFormData(prev => ({
			...prev,
			[id === "email" ? "username" : "password"]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await signIn("credentials", {
				username: formData.username,
				password: formData.password,
				redirect: true,
				callbackUrl: CALLBACK_URL,
			});

			if (result?.error) {
				setError("Invalid credentials");
			}
		} catch (err) {
			setError("An error occurred during sign in");
			console.error("Sign in error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const getProviderIcon = (providerName: string) => {
		const icons = {
			Google: <GoogleIcon />,
			Apple: <AppleIcon />,
			Facebook: <FacebookIcon />, // Uncomment if Facebook when permission issue is fixed
			GitHub: <GitHubIcon />
		};
		return icons[providerName as keyof typeof icons] || null;
	};

	return (
		<div className="flex flex-col justify-center items-center min-h-screen px-7 py-16 mt-10 bg-white dark:bg-gray-900">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<h1 className="text-3xl text-black dark:text-white font-bold">Login</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-4 text-center font-bold">
						Choose your preferred way to sign in to your account.
					</p>
				</div>

				<div className="space-y-8">
					{providers && (
						<div className="space-y-4">
							<div className="flex flex-col gap-4 w-full">
								{Object.values(providers).map((provider) => {
									if (provider.name === "Credentials") return null;
									if (provider.name === "Facebook") {
										// Temporarily hide Facebook until permission issue is resolved
										return null;
									}									
									const icon = getProviderIcon(provider.name);
									return (
										<SocialLoginButton key={provider.id} provider={provider} icon={icon} />
									);
								})}
							</div>

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300 font-bold">Or sign in with email</span>
								</div>
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="email" className="text-black dark:text-white block font-bold">
								Email
							</label>
							<input
								type="text"
								id="email"
								value={formData.username}
								onChange={handleInputChange}
								className="w-full border border-kaito-brand-ash-green rounded-lg py-2 px-3 font-bold bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
								required
								aria-required="true"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="pass" className="text-black dark:text-white block font-bold">
								Password
							</label>
							<input
								type="password"
								id="pass"
								value={formData.password}
								onChange={handleInputChange}
								className="w-full border border-kaito-brand-ash-green rounded-lg py-2 px-3 font-bold bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
								required
								aria-required="true"
							/>
						</div>

						{error && (
							<div className="text-red-500 text-sm font-bold" role="alert">
								{error}
							</div>
						)}

						<div className="flex justify-center w-full">
							<button
								type="submit"
								disabled={isLoading}
								className="w-full text-white bg-kaito-brand-ash-green border border-kaito-brand-ash-green hover:text-kaito-brand-ash-green hover:bg-white dark:hover:bg-gray-900 dark:hover:text-kaito-brand-ash-green focus:ring-4 focus:ring-kaito-brand-ash-green rounded-lg text-sm px-5 py-2 focus:outline-none disabled:opacity-50 font-bold"
							>
								{isLoading ? "Signing in..." : "Sign In"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;