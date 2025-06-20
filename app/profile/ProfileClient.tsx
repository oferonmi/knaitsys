// app/profile/ProfileClient.tsx
'use client';
import React, { useState } from 'react';
import UserProfileCard from '../../components/UserProfileCard';
import UserProfileForm from '../../components/UserProfileForm';

interface ProfileClientProps {
  name: string;
  email: string;
  image?: string;
  provider?: string;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ name, email, image, provider }) => {
  const [profile, setProfile] = useState({ name, image });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: { name: string; image?: string }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            setProfile({ name: data.name, image: data.image ?? undefined });
            setSuccess(true);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <UserProfileCard name={profile.name} email={email} image={profile.image} provider={provider} />
            <UserProfileForm name={profile.name} image={profile.image} onSave={handleSave} />
            {loading && <p className="text-blue-500 mt-2">Saving...</p>}
            {success && <p className="text-green-600 mt-2">Profile updated!</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
        </>
    );
};

export default ProfileClient;
