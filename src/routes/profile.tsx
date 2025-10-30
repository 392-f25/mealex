import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ProfileForm from '../components/ProfileForm.tsx';
import type { Profile } from '../types/Profile.ts';
import { useAuthState } from '../utilities/firebase';
import { useProfiles } from '../contexts/ProfilesContext';
import { getDatabase, ref, set } from 'firebase/database';
import { StrictMode } from 'react';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, isInitialLoading } = useAuthState();
  const { getProfileById } = useProfiles();

  if (isInitialLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("User not found.")
    navigate({ to: '/landing' });
    return null;
  }

  // Check if user already has a profile
  const existingProfile = getProfileById(user.uid);
  const isFirstTime = !existingProfile;

  const emptyProfile: Profile = {
    id: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    major: '',
    year: '',
    bio: '',
    tags: [],
  };

  const handleCancel = () => {
    navigate({ to: '/' });
  };

  const handleSubmit = async (data: Profile, isDirty: boolean) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const database = getDatabase();
      const profileData = {
        id: user.uid,
        name: data.name,
        email: data.email,
        major: data.major,
        year: data.year,
        bio: data.bio,
        tags: data.tags,
      };

      await set(ref(database, `/profiles/${user.uid}`), profileData);
      console.log('Profile saved successfully');
      navigate({ to: '/' });
    } catch (err) {
      console.error('Failed to save profile:', err);
      throw err;
    }
  };

  return (
    <StrictMode>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
        <ProfileForm
          profile={existingProfile || emptyProfile}
          onCancel={isFirstTime ? undefined : handleCancel}
          onSubmit={handleSubmit}
          isFirstTime={isFirstTime}
        />
      </div>
    </StrictMode>
  );
}