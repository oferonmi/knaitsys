// UserProfileForm.tsx
// Allows user to update profile info (name, image, etc.)
import React, { useState } from 'react';

interface UserProfileFormProps {
    name: string;
    image?: string;
    onSave: (data: { name: string; image?: string }) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ name: initialName, image: initialImage, onSave }) => {
    const [name, setName] = useState(initialName);
    const [image, setImage] = useState(initialImage || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, image });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <label className="flex flex-col">
                <span className="mb-1 font-medium">Name</span>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                />
            </label>
            <label className="flex flex-col">
                <span className="mb-1 font-medium">Profile Image URL</span>
                <input
                    type="text"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                />
            </label>
            <button
                type="submit"
                className="bg-kaito-brand-ash-green text-white rounded px-4 py-2 hover:bg-kaito-brand-ash-green  transition"
            >
                Save Changes
            </button>
        </form>
    );
};

export default UserProfileForm;
