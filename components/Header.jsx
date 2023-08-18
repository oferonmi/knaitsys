import Link from "next/link";
import Image from "next/image";
import { authOptions } from "../app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import {AuthHeader} from "./AuthHeader";
import { UnAuthHeader } from "./UnAuthHeader";
// import { usePathname } from 'next/navigation';
// import Logo from "../public/kaito_app_logo.png";

export const Header = async () => {
    const session = await getServerSession(authOptions);
    // const pathname = usePathname();

    // const handleSignin = (e) => {
    //     e.preventDefault();
    //     signIn();
    // };

    // const handleSignout = (e) => {
    //     e.preventDefault();
    //     signOut();
    // };

    return (
        <div className="header">
            <nav className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600 w-full items-center space-x-6"> {/*z-20 fixed*/}

                <div className="md:flex md:items-center md:justify-between md:mx-auto">

                    <div className="flex flex-row">
                        <Link href="/" passHref className="px-20 py-1 w-auto h-auto">
                            <Image src="/kaito_app_logo.png" alt="App logo" width={199} height={115} />
                        </Link>
                    </div>
                    
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