"use client";
import { signIn, getProviders } from "next-auth/react";
import React, { FormEventHandler, useRef, useState, useEffect } from "react";
import { GoogleIcon, FacebookIcon, GitHubIcon, AppleIcon } from "@/components/Icons";
import type { ClientSafeProvider } from "next-auth/react";

const Login = () => {
    const userName = useRef("");
    const passWd = useRef("");
    const [providers, setProviders] = useState<any>(null);

    useEffect(() => {
        const setUpProviders = async () => {
            const response = await getProviders();
            setProviders(response);
        };
        setUpProviders();
    }, []);

    // Handle creditial logins
    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            username: userName.current,
            password: passWd.current,
            redirect: true,
            callbackUrl: "/home",
        });
    };

    return (
		<>
			<div className="px-7 py-4 shadow bg-transparent flex flex-col justify-center items-center h-screen bg-gradient-to-br gap-1 bg-white bg-cover bg-center w-full">
				<h1 className="font-mono text-5xl text-black mt-30">Log in</h1>

				<div className="border-t-0 border-y-0 border-b-2 border-b-kaito-brand-ash-green">
					<form onSubmit={handleSubmit}>
						<div className="text-black">
							<label htmlFor="email">Email or Username</label>
						</div>
						<div className="text-kaito-brand-ash-green  w-full">
							<input
								type={"text"}
								id={"email"}
								onChange={(e) => (userName.current = e.target.value)}
								className="border border-kaito-brand-ash-green rounded-lg py-2"
							/>
						</div>

						<div className="text-black">
							<label htmlFor="pass">Password </label>
						</div>
						<div className="text-kaito-brand-ash-green ">
							<input
								type={"password"}
								id={"pass"}
								onChange={(e) => (passWd.current = e.target.value)}
								className="border border-kaito-brand-ash-green rounded-lg py-2"
							/>
						</div>

						<div className="flex flex-col justify-center items-center py-3">
							<input
								className="flex text-white text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green hover:text-kaito-brand-ash-green hover:bg-white focus:ring-4 focus:ring-kaito-brand-ash-green rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 focus:outline-none gap-1 shadow"
								type={"submit"}
								value={"Sign In with Credentials"}
							/>
						</div>
					</form>
				</div>

				<p className="mt-2 text-xl text-black">Or</p>

				<div className="flex flex-col justify-center items-center py-4">
					{providers &&
					Object.values(
						providers as Record<string, ClientSafeProvider>
					).map((provider: ClientSafeProvider) => {
						var loginIcon = <></>;
						if (provider.name === "Google") loginIcon = <GoogleIcon />;
						if (provider.name === "Apple") loginIcon = <AppleIcon />;
						if (provider.name === "Facebook") loginIcon = <FacebookIcon />;
						if (provider.name === "GitHub") loginIcon = <GitHubIcon />;

						if (provider.name !== "Credentials") {
							return (
								<div key={provider.id}>
								<button
									onClick={() =>
										signIn(provider.id, {
											callbackUrl: "/ai_tools",
										})
									}
									className="flex text-white text-justify bg-kaito-brand-ash-green border border-kaito-brand-ash-green hover:bg-white hover:text-kaito-brand-ash-green focus:ring-1 focus:ring-kaito-brand-ash-green rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 focus:outline-none gap-1 shadow"
								>
									{loginIcon} Sign In with {provider.name}
								</button>
								</div>
							);
						}
					})}
				</div>
			</div>
		</>
    );
};

export default Login;