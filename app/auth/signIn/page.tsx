
"use client";
import { signIn } from "next-auth/react";
import React, { useRef } from "react";

const Login = () => {
    const emailAddr = useRef("");
    const passWd = useRef("");

    const onSubmit = async () => {
        const result = await signIn("credentials", {
            email: emailAddr.current,
            password: passWd.current,
            redirect: true,
            callbackUrl: "/",
        });
    };

    return (
        <div
            className={
                "flex flex-col justify-center items-center  h-screen bg-gradient-to-br gap-1 from-cyan-300 to-sky-600"
            }
        >
            <div className="px-7 py-4 shadow bg-white rounded-md flex flex-col gap-2">
                <div>
                    <label htmlFor="email">Email</label>
                </div>
                <div>
                    <input
                        type={"email"}
                        id={"email"}
                        onChange={(e) => (emailAddr.current = e.target.value)}
                        className="outline outline-1 rounded-lg py-2"
                    />
                </div>

                <div>
                    <label htmlFor="pass">Password </label>
                </div>
                <div>
                    <input
                        type={"password"}
                        id={"pass"}
                        onChange={(e) => (passWd.current = e.target.value)}
                        className="outline outline-1 rounded-lg py-2"
                    />
                </div>

                <div className="flex flex-col justify-center items-center py-3">
                    <button
                        className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1 shadow" 
                        onClick={onSubmit}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;