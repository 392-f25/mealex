import { useState, useEffect } from "react";
import { useProfiles } from "../contexts/ProfilesContext";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
// import {type Profile} from '../types/Profile.ts'

interface ProfilePageProps {
  userID: string;
}

export default function ProfilePage({ userID }: ProfilePageProps) {
  const { isLoading, getProfileById } = useProfiles();
  const profile = getProfileById(userID);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Profile not found</p>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 transition hover:text-slate-900 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Profile Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {/* Name Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900">{profile.name}</h1>
            <p className="mt-2 text-slate-600">
              {profile.major} • {profile.year}
            </p>
          </div>

          {/* Email Section */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Contact</h2>
            <div className="flex items-center gap-3">
              <span className="text-slate-900">{profile.email}</span>
              <button
                onClick={copyEmail}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">About</h2>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests Section */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability Section */}
          {profile.availability && profile.availability.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Availability</h2>
              <div className="flex flex-wrap gap-2">
                {profile.availability.map((slot) => (
                  <span
                    key={slot}
                    className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}