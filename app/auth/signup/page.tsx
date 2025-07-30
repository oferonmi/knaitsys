"use client";

import { signIn, getProviders, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { GoogleIcon, FacebookIcon, GitHubIcon, AppleIcon } from "@/components/Icons";
import type { ClientSafeProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
    aria-label={`Sign up with ${provider.name}`}
  >
    {icon} <span className="text-center font-bold">Sign up with {provider.name}</span>
  </button>
);

const SignUp = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/ai_tools");
    }
  }, [status, router]);

  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Here you would typically make an API call to create the user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // If registration is successful, sign in the user
      await signIn("credentials", {
        username: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: CALLBACK_URL,
      });
    } catch (err) {
      setError("An error occurred during sign up");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (providerName: string) => {
    const icons = {
      Google: <GoogleIcon />,
      Apple: <AppleIcon />,
      Facebook: <FacebookIcon />,
      GitHub: <GitHubIcon />
    };
    return icons[providerName as keyof typeof icons] || null;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-7 py-16 mt-16 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl text-gray-700 dark:text-white font-bold">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 text-center font-bold">
            Use social sign up to register.
          </p>
        </div>

        {/* Social signup section moved above the form */}
        {providers && (
          <>
            <div className="flex flex-col gap-4 w-full">
              {Object.values(providers).map((provider) => {
                if (provider.name === "Credentials") return null;
                if (provider.name === "Facebook") {
                  // Temporarily hide Facebook until permission issue is resolved
                  return null;
                }
                const icon = getProviderIcon(provider.name);
                return (
                  <SocialLoginButton
                    key={provider.id}
                    provider={provider}
                    icon={icon}
                  />
                );
              })}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300 font-bold">
                  Or enter details to create your account
                </span>
              </div>
            </div>
          </>
        )}

        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-black dark:text-white block font-bold"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-kaito-brand-ash-green rounded-lg py-2 px-3 font-bold bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-black dark:text-white block font-bold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-kaito-brand-ash-green rounded-lg py-2 px-3 font-bold bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-black dark:text-white block font-bold"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-kaito-brand-ash-green rounded-lg py-2 px-3 font-bold bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-black dark:text-white block font-bold"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
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
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;