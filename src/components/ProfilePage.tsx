import { useState, useEffect } from "react";
import { useProfiles } from "../contexts/ProfilesContext";
import { ArrowLeft, Copy, CheckCircle, MessageCircle } from "lucide-react";
import InvitationForm from "./InvitationForm";
import { useAuthState, useDataQuery } from "../utilities/firebase";

interface ProfilePageProps {
  userID: string;
}

export default function ProfilePage({ userID }: ProfilePageProps) {
  const { isLoading, getProfileById } = useProfiles();
  const profile = getProfileById(userID);
  const { user } = useAuthState();
  const isOwnProfile = user && profile && user.uid === profile.id;
  const [copied, setCopied] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  
  // Fetch invitations when needed
  const [invitationData, isLoadingInvitations] = useDataQuery('/invitations');
  
  useEffect(() => {
    if (showInvitations && isOwnProfile && invitationData) {
      const invitationsList = Object.entries(invitationData)
        .map(([id, data]: [string, any]) => ({ ...data, id }))
        .filter((invitation) => invitation.receiverId === userID)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setInvitations(invitationsList);
    }
  }, [showInvitations, userID, isOwnProfile, invitationData]);

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
    <>
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
        
        {/* Invitations Modal */}
        {showInvitations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Invitations</h2>
                <button
                  onClick={() => setShowInvitations(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
              {invitations.length > 0 ? (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{invitation.meal}</h3>
                        <span className="text-sm text-slate-500">
                          {new Date(invitation.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{invitation.message}</p>
                      <div className="text-sm text-slate-500">
                        From: {getProfileById(invitation.senderId)?.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 text-center py-8">
                  No invitations yet
                </p>
              )}
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Profile Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        
          {/* Profile Photo and Name Section */}
        <div className="mb-8 flex items-start gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.profileUrl ? (
              <img
                src={profile.profileUrl}
                alt={`${profile.name}'s profile`}
                className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            {/* Fallback avatar */}
            <div className={`h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300 ${profile.profileUrl ? 'hidden' : ''}`}>
              <span className="text-2xl font-bold text-slate-500">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Name and Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900">{profile.name}</h1>
            <p className="mt-2 text-slate-600">
              {profile.major} • {profile.year}
            </p>
          </div>
        </div>

          {/* Email Section */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Contact</h2>
            <div className="flex items-center gap-3">
              <span className="text-slate-900">{profile.email}</span>
              <div className="flex gap-2">
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
                {isOwnProfile && (
                  <button
                    onClick={() => setShowInvitations(true)}
                    className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    View Invitations
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">About</h2>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200"
                  >
                    {interest}
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

          {/* Invitation Form */}
          {user && !isOwnProfile && (
            <InvitationForm receiverId={profile.id} />
          )}
        </div>
      </div>
    </div>
    </>
  );
}