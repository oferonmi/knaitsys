"use client";
import { signIn } from "next-auth/react";
import React, { FormEventHandler, useRef } from "react";

const Login = () => {
    const userName = useRef("");
    const passWd = useRef("");

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            username: userName.current,
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
            
            {/* <div>current path: { pathname }</div> */}
            <form className="px-7 py-4 shadow bg-white dark:bg-gray-900 rounded-md flex flex-col gap-2" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Username</label>
                </div>
                <div>
                    <input
                        type={"text"}
                        id={"email"}
                        onChange={(e) => (userName.current = e.target.value)}
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
                        className="outline dark:outline outline-1 dark:outline-1 rounded-lg dark:rounded-lg py-2"
                    />
                </div>

                <div className="flex flex-col justify-center items-center py-3">
                    <input
                        className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1 shadow"
                        type={"submit"}
                        value={"Login"}
                    />
               </div>
            </form>
        </div>
    );
};

export default Login;