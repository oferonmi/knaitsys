import Image from "next/image";
import Link from "next/link";
import { authOptions } from "../app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { AuthHeader } from "./AuthHeader";
import { UnAuthHeader } from "./UnAuthHeader";
import { MenuItems } from "./MenuItems";

export const Header = async ({ menu }) => {
    const session = await getServerSession(authOptions);

    const BrandLogo = () => (
        <Link href={session ? "/ai_tools" : "/home"} className="py-1 w-auto h-auto">
            <div className="flex items-center ml-3.5">
                <Image 
                    src="/knaitsys.png" 
                    priority
                    alt="App logo" 
                    width={330} 
                    height={115}
                />
            </div>
        </Link>
    );

    return (
        <div className="flex flex-col border-b border-b-kaito-brand-ash-green">
            <header className="bg-gray-100 w-full items-center space-x-6 sticky top-0 z-10">
                <nav className="md:flex md:items-center md:justify-between">
                    <BrandLogo />
                    <MenuItems items={menu} /> 
                    {session ? <AuthHeader /> : <UnAuthHeader />}
                </nav>
            </header>
        </div>
    );
};