'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  phone?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
}

export default function ProfileSettings() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    notificationPreferences: {
      email: true,
      push: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data.profile);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSuccessMessage('Profile updated successfully');
      
      // Update session data if name or image changed
      if (session?.user && (
        session.user.name !== profile.name ||
        session.user.image !== profile.image
      )) {
        await updateSession({
          ...session,
          user: {
            ...session.user,
            name: profile.name,
            image: profile.image,
          },
        });
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-600">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="photo"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Photo
          </label>
          <div className="mt-2 flex items-center gap-x-3">
            {profile.image ? (
              <img
                src={profile.image}
                alt=""
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <PhotoIcon
                className="h-12 w-12 text-gray-300"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Change
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Email
          </label>
          <div className="mt-2">
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Phone Number
          </label>
          <div className="mt-2">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium leading-6 text-gray-900 mb-4">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="email-notifications"
                  name="email-notifications"
                  type="checkbox"
                  checked={profile.notificationPreferences.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        email: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="email-notifications"
                  className="text-sm font-medium leading-6 text-gray-900"
                >
                  Email notifications
                </label>
                <p className="text-sm text-gray-500">
                  Get notified about claim updates and business changes via email.
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="push-notifications"
                  name="push-notifications"
                  type="checkbox"
                  checked={profile.notificationPreferences.push}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      notificationPreferences: {
                        ...profile.notificationPreferences,
                        push: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor="push-notifications"
                  className="text-sm font-medium leading-6 text-gray-900"
                >
                  Push notifications
                </label>
                <p className="text-sm text-gray-500">
                  Receive push notifications for important updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          className="text-sm font-semibold leading-6 text-gray-900"
          onClick={() => {
            setProfile({
              name: '',
              email: '',
              notificationPreferences: {
                email: true,
                push: true,
              },
            });
          }}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
