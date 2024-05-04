import Image from "next/image";
import Link from "next/link";
// import { useEffect } from "react";
import { authOptions } from "../app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { AuthHeader } from "./AuthHeader";
import { UnAuthHeader } from "./UnAuthHeader";

export const Header = async ({menu}) => {
    const session = await getServerSession(authOptions);

    const handleClick = (url) => {
        // window.location.reload()
        // router.refresh();
    };

    return (
        <div className="flex flex-col border-b-2">
            <header className="bg-gray-100 border-gray-200 w-full items-center space-x-6 sticky top-0"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">

                    <Link href="/ai_tools" passHref className="py-1 w-auto h-auto">
                        <div className="flex flex-row">
                            <div>
                                <Image src="/logos/D9E2D5_3E6765/KAITO_logos_transparent.png" alt="App logo" width={115} height={115} />
                            </div>
                            <div className="mt-4">
                                <Image src="/kaitosys_app_logo.png" alt="App logo text" width={215} height={75} />
                            </div>
                        </div>
                    </Link>

                    (<div className="flex flex-row">
                        {menu?.length > 0
                            ?  [...menu].map((m) => {
                                return (
                                    <div key={m.id} className="text-black mr-2">
                                        <Link href={m.url} passHref prefetch={false}>
                                            {m.value}
                                        </Link>
                                    </div>
                                );
                            }) : ""
                        }
                    </div>
                     
                    {session ? (
                        <AuthHeader />
                    ):(
                        <UnAuthHeader />
                    )}
                    
                </div>
                
            </header>
        </div>
    );
}