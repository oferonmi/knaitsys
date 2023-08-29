"use client";
import { signIn, getProviders, getSession } from "next-auth/react";
import React, { FormEventHandler, useRef} from "react";

const Login = async () => {
    const userName = useRef("");
    const passWd = useRef("");

    const providers = await getProviders();
    // console.log(providers);

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
        <>
        <div className="px-7 py-4 shadow bg-transparent dark:bg-transparent rounded-md flex flex-col justify-center items-center  h-screen bg-gradient-to-br gap-1 from-gray-100 to-gray-400">
            <h1 className="font-mono text-5xl mt-30">
                Log in
            </h1>
            
            <div className="border-t-0 border-y-0 border-b-2 border-b-gray-200">
                <form onSubmit={handleSubmit} >
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
                            value={"Sign In with Credentials"}
                        />
                    </div>
                </form>
            </div>

            <p className="mt-2 text-xl">
                Or
            </p>

            <div className="flex flex-col justify-center items-center py-4">
                {Object.values(providers).map((provider) => {
                    if(provider.name !== "Credentials"){
                        return(
                            <div key={provider.id} >
                                <button 
                                    onClick={ () => signIn(provider.id, {redirect: true, callbackUrl: "/",}) }
                                    className="flex text-white text-justify bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 rounded-lg font-medium text-sm px-5 py-2 mr-2 mb-2 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none dark:focus:ring-teal-800 gap-1 shadow"
                                >
                                    Sign In with {provider.name}
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

// export async function getServerSideProps(context) {
//   const providers = await getProviders();
//   return {
//     props: { providers },
//   };
// }