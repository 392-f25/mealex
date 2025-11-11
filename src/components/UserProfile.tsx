import { useForm } from 'react-hook-form';
import { type Profile } from '../types/Profile.ts';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useAuthState,
  useDataQuery,
  useDataUpdate,
} from '../utilities/firebase.ts';
import { useProfiles } from '../contexts/ProfilesContext.tsx';
import { type Message } from '../types/Message.ts';

const currentYear = new Date().getFullYear();

// Zod schema for profile validation
const profileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  major: z.string().min(1, 'Major is required'),
  year: z.union([
    z
      .string()
      .regex(/^\d{4}$/, 'Must be a 4-digit year')
      .refine(
        (val) => {
          const num = Number(val);
          return num >= currentYear && num <= 2100;
        },
        { message: `Graduation year must be between ${currentYear} and 2100` }
      ),
    z.literal('Graduate'),
  ]),
  bio: z
    .string()
    .min(1, 'Bio is required')
    .max(500, 'Bio must be less than 500 characters'),
  interests: z
    .array(z.string())
    .min(1, 'Add at least one interest')
    .max(5, 'Maximum 5 interests allowed'),
  availability: z.array(z.string()).min(1, 'Add at least one availability'),
  linkedinUrl: z.string().optional().or(z.literal('')).refine((val) => {
    if (!val || val === '') return true;
    return val.includes('linkedin.com') || val.startsWith('https://linkedin.com') || val.startsWith('https://www.linkedin.com');
  }, { message: 'Please enter a valid LinkedIn URL' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile;
  onCancel?: () => void;
  onSubmit: (data: Profile, isDirty: boolean) => Promise<void>;
  isFirstTime?: boolean;
}

const ProfileForm = ({
  profile,
  onCancel,
  onSubmit,
  isFirstTime = false,
}: ProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [availabilityInput, setAvailabilityInput] = useState<string>('');
  const [view, setView] = useState('incoming'); // 'incoming' or 'outgoing'

  const { user } = useAuthState();
  const { getProfileById } = useProfiles();

  // Fetch incoming messages
  const incomingQueryPath = user
    ? `/invitations/${user.uid}/messages`
    : 'no-user-path';
  const [incomingMessagesData] = useDataQuery(incomingQueryPath);
  const [incomingUserMessages, setIncomingUserMessages] = useState<Message[]>(
    []
  );

  // hook to update incoming messages (we will update individual message status using relative paths)
  const [updateIncomingMessages] = useDataUpdate(incomingQueryPath);

  // Fetch all messages for outgoing filtering
  const allMessagesQueryPath = '/invitations';
  const [allMessagesData] = useDataQuery(allMessagesQueryPath);
  const [outgoingUserMessages, setOutgoingUserMessages] = useState<Message[]>(
    []
  );

  useEffect(() => {
    if (user && incomingMessagesData) {
      const messages = Object.entries(incomingMessagesData).map(
        ([id, data]: [string, any]) => ({
          id,
          ...data,
        })
      );
      setIncomingUserMessages(messages);
    } else {
      setIncomingUserMessages([]);
    }
  }, [user, incomingMessagesData]);

  useEffect(() => {
    if (user && allMessagesData) {
      const allMessages: Message[] = [];
      Object.values(allMessagesData).forEach((userMessages: any) => {
        if (userMessages.messages) {
          Object.entries(userMessages.messages).forEach(
            ([id, data]: [string, any]) => {
              allMessages.push({ id, ...data });
            }
          );
        }
      });

      const outgoing = allMessages.filter((msg) => msg.sender === user.uid);
      setOutgoingUserMessages(outgoing);
    } else {
      setOutgoingUserMessages([]);
    }
  }, [user, allMessagesData]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: profile
      ? {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          major: profile.major,
          year: String(profile.year),
          bio: profile.bio,
          interests: profile.interests || [],
          availability: profile.availability || [],
          linkedinUrl: profile.linkedinUrl || '',
        }
      : undefined,
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
  });

  const interests = watch('interests');
  const availability = watch('availability');

  const handleAddTag = () => {
    if (tagInput.trim() && !interests.includes(tagInput.trim())) {
      setValue('interests', [...interests, tagInput.trim()], {
        shouldDirty: true,
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'interests',
      interests.filter((tag) => tag !== tagToRemove),
      { shouldDirty: true }
    );
  };

  const handleAddAvailability = () => {
    if (
      availabilityInput.trim() &&
      !availability.includes(availabilityInput.trim())
    ) {
      setValue('availability', [...availability, availabilityInput.trim()], {
        shouldDirty: true,
      });
      setAvailabilityInput('');
    }
  };

  const handleRemoveAvailability = (availabilityToRemove: string) => {
    setValue(
      'availability',
      availability.filter((slot) => slot !== availabilityToRemove),
      { shouldDirty: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAvailabilityKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAvailability();
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    console.log('Form submitted: ', data);
    try {
      if (onSubmit) {
        // ProfileFormData now matches Profile type completely
        await onSubmit(data as Profile, isDirty);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save profile data'
      );
    }
  };

  return (
    <div className="flex gap-8 w-full max-w-6xl mx-auto">
      {/* Left section - Profile Form */}
      <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-2">
          {isFirstTime ? 'Complete Your Profile' : 'Edit Your Profile'}
        </h2>
        {isFirstTime && (
          <p className="text-sm text-slate-600 mb-6">
            Tell us about yourself so other students can find you
          </p>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Hidden ID field */}
          <input type="hidden" {...register('id')} />

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Full Name
            </span>
            <input
              type="text"
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="John Doe"
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.name.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Email</span>
            <input
              type="email"
              {...register('email')}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 mt-1 shadow-sm text-gray-600 cursor-not-allowed"
              placeholder="your.email@university.edu"
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Email is pre-filled from your Google account
            </span>
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">LinkedIn Profile (Optional)</span>
          <input
            type="url"
            {...register('linkedinUrl')}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            placeholder="https://www.linkedin.com/in/your-profile"
          />
          <span className="text-xs text-gray-500 mt-1 block">
            Add your LinkedIn profile to help others connect with you professionally
          </span>
          {errors.linkedinUrl && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.linkedinUrl.message}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Interests</span>
            <input
              type="text"
              {...register('major')}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder="Computer Science"
            />
            {errors.major && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.major.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Graduation Year
            </span>
            <input
              type="text"
              {...register('year')}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              placeholder={`e.g. ${currentYear} (or "Graduate")`}
            />
            {errors.year && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.year.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Bio</span>
            <textarea
              {...register('bio')}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
              placeholder="Tell us about yourself..."
              rows={4}
            />
            {errors.bio && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.bio.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Interests
            </span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="Type an interest and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
              >
                Add
              </button>
            </div>
            {errors.interests && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.interests.message}
              </span>
            )}
            {interests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">
              Availability
            </span>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={availabilityInput}
                onChange={(e) => setAvailabilityInput(e.target.value)}
                onKeyPress={handleAvailabilityKeyPress}
                className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="e.g. Monday 9-11 AM, Weekdays after 3 PM"
              />
              <button
                type="button"
                onClick={handleAddAvailability}
                className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
              >
                Add
              </button>
            </div>
            {errors.availability && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.availability.message}
              </span>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Add time slots when you're available to connect with others
            </div>
            {availability.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {availability.map((slot) => (
                  <div
                    key={slot}
                    className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => handleRemoveAvailability(slot)}
                      className="text-green-600 hover:text-green-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </label>

          <div className="flex justify-left gap-3 mt-6 pt-4 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isSubmitting
                ? 'Saving...'
                : isFirstTime
                  ? 'Create Profile'
                  : 'Save Changes'}
            </button>
          </div>
        </form>

        {submitError && (
          <div className="mt-4 text-red-600 font-medium">{submitError}</div>
        )}
      </div>

      {/* Right section - Messages */}
      <div className="w-96 bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invitations</h2>
          <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setView('incoming')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'incoming' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Incoming
            </button>
            <button
              onClick={() => setView('outgoing')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${view === 'outgoing' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              Outgoing
            </button>
          </div>
        </div>

        {view === 'incoming' && (
          <>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Pending Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Pending Invitations
                </h3>
                {incomingUserMessages.filter(
                  (msg) => !msg.status || msg.status === 'pending'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {incomingUserMessages
                      .filter((msg) => !msg.status || msg.status === 'pending')
                      .map((msg) => {
                        const senderProfile = getProfileById(msg.sender);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                {senderProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wants to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  // update message status to accepted
                                  updateIncomingMessages({
                                    [`${msg.id}/status`]: 'accepted',
                                  });
                                  // optimistic UI update
                                  setIncomingUserMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, status: 'accepted' }
                                        : m
                                    )
                                  );
                                }}
                                disabled={msg.status !== 'pending'}
                                className={`px-2 py-1 text-xs rounded ${msg.status === 'accepted' ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                              >
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Accept'}
                              </button>
                              <button
                                onClick={() => {
                                  // update message status to rejected
                                  updateIncomingMessages({
                                    [`${msg.id}/status`]: 'rejected',
                                  });
                                  setIncomingUserMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, status: 'rejected' }
                                        : m
                                    )
                                  );
                                }}
                                disabled={msg.status !== 'pending'}
                                className={`px-2 py-1 text-xs rounded ${msg.status === 'rejected' ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                              >
                                {msg.status === 'rejected'
                                  ? 'Declined'
                                  : 'Decline'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    You have no pending invitations.
                  </div>
                )}
              </div>

              {/* Resolved Invitations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Past Invitations
                </h3>
                {incomingUserMessages.filter(
                  (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {incomingUserMessages
                      .filter(
                        (msg) =>
                          msg.status === 'accepted' || msg.status === 'rejected'
                      )
                      .map((msg) => {
                        const senderProfile = getProfileById(msg.sender);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                {senderProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p
                                className={`text-sm mt-2 ${msg.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Declined'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    No past invitations.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'outgoing' && (
          <>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Pending Outgoing Invitations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Pending Invitations
                </h3>
                {outgoingUserMessages.filter(
                  (msg) => !msg.status || msg.status === 'pending'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {outgoingUserMessages
                      .filter((msg) => !msg.status || msg.status === 'pending')
                      .map((msg) => {
                        const receiverProfile = getProfileById(msg.receiver);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: Pending
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    You have no pending outgoing invitations.
                  </div>
                )}
              </div>

              {/* Resolved Outgoing Invitations */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Past Invitations
                </h3>
                {outgoingUserMessages.filter(
                  (msg) =>
                    msg.status === 'accepted' || msg.status === 'rejected'
                ).length > 0 ? (
                  <div className="space-y-2">
                    {outgoingUserMessages
                      .filter(
                        (msg) =>
                          msg.status === 'accepted' || msg.status === 'rejected'
                      )
                      .map((msg) => {
                        const receiverProfile = getProfileById(msg.receiver);
                        return (
                          <div
                            key={msg.id}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-sm">
                                To: {receiverProfile?.name ?? 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {msg.body ?? 'Wanted to connect!'}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.timestamp || 'No timestamp'}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.status === 'accepted'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                Status:{' '}
                                {msg.status === 'accepted'
                                  ? 'Accepted'
                                  : 'Declined'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    No past outgoing invitations.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
