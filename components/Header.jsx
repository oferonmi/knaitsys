import Link from "next/link";
import Image from "next/image";
import { authOptions } from "../app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import {AuthHeader} from "./AuthHeader";
import { UnAuthHeader } from "./UnAuthHeader";
// import Logo from "../public/kaito_app_logo.png";

export const Header = async () => {
    const session = await getServerSession(authOptions);

    return (
        <div className="header">
            <nav className="bg-white border-gray-200 w-full items-center space-x-6"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">

                    <Link href="/ai_tools" passHref className="px-20 py-1 w-auto h-auto">
                        <div className="flex flex-row">
                            <div>
                                <Image src="/logos/D9E2D5_3E6765/KAITO_logos_transparent.png" alt="App logo" width={115} height={115} />
                            </div>
                            <div>
                                <Image src="/kaito_app_logo.png" alt="App logo" width={199} height={115} />
                            </div>
                        </div>
                    </Link>
                    
                    
                    {session ? (
                        <AuthHeader />
                    ):(
                        <UnAuthHeader />
                    )}
                    
                </div>
                
            </nav>
        </div>
    )
}