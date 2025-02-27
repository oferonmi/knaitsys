import { getServerSession } from "next-auth/next";
import { authOptions } from "../app/api/auth/[...nextauth]/options";
import { Header } from "./Header";

export async function HeaderWrapper({ menu }) {
    const session = await getServerSession(authOptions);
    return <Header menu={menu} session={session} />;
}