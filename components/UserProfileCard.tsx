// UserProfileCard.tsx
// Displays user info (avatar, name, email, provider, etc.)
import React from 'react';
import Image from "next/image";

interface UserProfileCardProps {
    name: string;
    email: string;
    image?: string;
    provider?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
    name,
    email,
    image,
    provider,
}) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <Image 
            width={96}
            height={96}
            src={image ? image : "/avatars/default_user_avatar.JPG"}
            alt="User avatar"
            className="w-24 h-24 rounded-full mb-4 border-2 border-gray-300 dark:border-gray-700"
        />

        <h2 className="text-xl font-semibold mb-1">{name}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-1">{email}</p>
        {provider && (
            <span className="text-xs text-gray-400">Signed in with {provider}</span>
        )}
    </div>
);

export default UserProfileCard;
