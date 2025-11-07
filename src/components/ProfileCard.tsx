import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { type Profile } from "../types/Profile";

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const goToProfile = () => {
    // navigate to the profile page for this user's id (as a string)
    // using a simple path - the app's router will match `/profilepage/$uuid`
    navigate({ to: `/profilepage/${profile.id}` });
  };
  
  return (
    <div className="flex items-start gap-4">
      {/* Profile Photo */}
      <div className="flex-shrink-0">
        {profile.photoUrl && !imageError ? (
          <img
            src={profile.photoUrl}
            alt={`${profile.name}'s profile`}
            className="h-12 w-12 rounded-full object-cover border-2 border-slate-200"
            referrerPolicy="no-referrer"
            onError={(e) => {
              console.log('Image failed to load:', e);
              console.log('Image src was:', profile.photoUrl);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('Image loaded successfully!');
            }}
          />
        ) : (
          /* Fallback avatar */
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
            <span className="text-sm font-bold text-slate-500">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="m-0 text-base font-semibold">{profile.name}</h3>

        {(profile.major || profile.year) && (
          <p className="mt-1 text-xs text-slate-600">
            {profile.major}
            {profile.major && profile.year ? " • " : " "}
            {profile.year}
          </p>
        )}

        {profile.bio && <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>}

        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={goToProfile}
          className="rounded-md mt-4 bg-blue-600 px-3 py-1 text-sm font-medium text-white cursor-pointer hover:bg-blue-700"
        >
          Connect
        </button>
      </div>
    </div>
  );
}