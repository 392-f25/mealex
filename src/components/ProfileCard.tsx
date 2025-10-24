type Profile = {
  name: string;
  initials: string;
  major: string;
  year: string;
  bio?: string;
  tags?: string[];
};

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-500 text-center font-bold text-white">
        {profile.initials}
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
    </div>
  );
}