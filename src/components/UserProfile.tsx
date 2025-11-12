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
  mealPreference: z
    .array(z.string())
    .min(1, 'Add at least one meal preference')
    .max(5, 'Maximum 5 meal preferences allowed'),
  availability: z.array(z.string()).min(1, 'Add at least one availability'),
  linkedinUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return (
          val.includes('linkedin.com') ||
          val.startsWith('https://linkedin.com') ||
          val.startsWith('https://www.linkedin.com')
        );
      },
      { message: 'Please enter a valid LinkedIn URL' }
    ),
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
          mealPreference: profile.mealPreference || [],
          availability: profile.availability || [],
          linkedinUrl: profile.linkedinUrl || '',
        }
      : undefined,
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
  });

  const interests = watch('interests');
  const availability = watch('availability');
  const mealPreference = watch('mealPreference');

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

  const handleAddMealPreference = () => {
    if (
      mealPreferenceInput.trim() &&
      !mealPreference.includes(mealPreferenceInput.trim())
    ) {
      setValue('mealPreference', [...mealPreference, mealPreferenceInput.trim()], {
        shouldDirty: true,
      });
      setMealPreferenceInput('');
    }
  };

  const handleRemoveMealPreference = (preferenceToRemove: string) => {
    setValue(
      'mealPreference',
      mealPreference.filter((pref) => pref !== preferenceToRemove),
      { shouldDirty: true }
    );
  };

  const handleMealPreferenceKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMealPreference();
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    console.log('Form submitted: ', data);
    try {
      if (onSubmit) {
        // ProfileFormData now matches Profile type completely
        await onSubmit(data as Profile, isDirty);
        // Switch back to display mode after successful save (unless it's first time)
        if (!isFirstTime) {
          setIsEditing(false);
        }
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save profile data'
      );
    }
  };

  return (
    <div className="flex gap-8 w-full max-w-6xl mx-auto">
      {/* Left section - Profile Display/Form */}
      <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
        {!isEditing ? (
          // Static Profile Display
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Profile</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Display */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Name
                </h3>
                <p className="text-gray-900">{profile.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Email
                </h3>
                <p className="text-gray-900">{profile.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Major
                </h3>
                <p className="text-gray-900">{profile.major}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Graduation Year
                </h3>
                <p className="text-gray-900">{profile.year}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Bio
                </h3>
                <p className="text-gray-900 leading-relaxed">{profile.bio}</p>
              </div>

              {profile.linkedinUrl && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    LinkedIn
                  </h3>
                  <a
                    href={
                      profile.linkedinUrl.startsWith('http')
                        ? profile.linkedinUrl
                        : `https://${profile.linkedinUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition"
                  >
                    {profile.linkedinUrl}
                  </a>
                </div>
              )}

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.mealPreference && profile.mealPreference.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Meal Preferences
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.mealPreference.map((preference) => (
                      <span
                        key={preference}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {preference}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.availability && profile.availability.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Availability
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.map((slot) => (
                      <span
                        key={slot}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Edit Form
          <div>
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
                <span className="text-sm font-semibold text-gray-700">
                  Email
                </span>
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
                <span className="text-sm font-semibold text-gray-700">
                  LinkedIn Profile (Optional)
                </span>
                <input
                  type="url"
                  {...register('linkedinUrl')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Add your LinkedIn profile to help others connect with you
                  professionally
                </span>
                {errors.linkedinUrl && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.linkedinUrl.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Interests
                </span>
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
                  Meal Preferences
                </span>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={mealPreferenceInput}
                    onChange={(e) => setMealPreferenceInput(e.target.value)}
                    onKeyPress={handleMealPreferenceKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="e.g. Vegetarian, Vegan, Halal, Kosher"
                  />
                  <button
                    type="button"
                    onClick={handleAddMealPreference}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
                  >
                    Add
                  </button>
                </div>
                {errors.mealPreference && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.mealPreference.message}
                  </span>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Add your dietary preferences or restrictions
                </div>
                {mealPreference.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mealPreference.map((preference) => (
                      <div
                        key={preference}
                        className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {preference}
                        <button
                          type="button"
                          onClick={() => handleRemoveMealPreference(preference)}
                          className="text-orange-600 hover:text-orange-800 font-bold"
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
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (onCancel && isFirstTime) {
                      onCancel();
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition"
                >
                  {isFirstTime ? 'Cancel' : 'Cancel Edit'}
                </button>
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
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
