// app/profile/page.tsx
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import  ProfileClient from './ProfileClient';


export default async function ProfilePage() {
    // Get user session (NextAuth)
    const session = await getServerSession();
    if (!session || !session.user) {
        redirect('/auth/signin');
    }
    const { name, email, image } = session.user;
    const provider = 'credentials';

    return (
        <main className=" max-w-xl mx-auto p-6 mt-36  bg-white dark:bg-gray-900 rounded-lg shadow-md border  border-gray-200">
                <h1 className="text-2xl font-bold  mb-6">Your Profile</h1>
                <ProfileClient
                    name={name || ""}
                    email={email || ""}
                    image={image ?? undefined}
                    provider={provider}
                />
        </main>
    );
}
