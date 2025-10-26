import { useState, useEffect } from "react";

export default function ProfilePage() {
  // Display the following profile information.
  const profile = {
    name: "Alice Brown",
    email: "alicebrown2028@u.northwestern.edu",
    major: "Computer Science",
    year: "2028",
    bio: "Interested in AI research and internships.",
    tags: ["AI", "Internships"],
    initials: "AB",
  };

  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch (e) {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = profile.email;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
    }
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-500 flex items-center justify-center text-2xl font-bold text-white">
          {profile.initials}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{profile.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-slate-600 m-0">{profile.email}</p>
            <button
              onClick={copyEmail}
              className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
              aria-label="Copy email to clipboard"
            >
              {copied ? "Copied!" : "Connect"}
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            {profile.major} • {profile.year}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold">About</h2>
        <p className="mt-2 text-sm text-gray-700">{profile.bio}</p>
      </div>

      {profile.tags && profile.tags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">Interests</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

