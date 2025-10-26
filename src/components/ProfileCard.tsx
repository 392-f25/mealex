import { useNavigate } from "@tanstack/react-router";

import { type Profile } from "../types/Profile";

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  const navigate = useNavigate();

  const goToProfile = () => {
    // navigate to the profile page for this user's id (as a string)
    // using a simple path - the app's router will match `/profilepage/$uuid`
    navigate({ to: `/profilepage/${profile.id}` });
  };
  return (
    <div className="group flex items-start gap-4 p-4 rounded-lg transition-all transform hover:scale-101 hover:shadow-md">

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

        {profile.tags && profile.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Connect button: hidden by default, revealed when the card is hovered */}
      <div className="ml-4 flex items-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        <button
          onClick={goToProfile}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
        >
          Connect
        </button>
      </div>
    </div>
  );
}