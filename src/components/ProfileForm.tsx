import { useForm } from 'react-hook-form'
import { type Profile } from '../types/Profile.ts';
import { useState } from 'react'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const currentYear = new Date().getFullYear();

// Zod schema for profile validation
const profileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  major: z.string().min(1, 'Major is required'),
  year: z.union([
    z.string().regex(/^\d{4}$/, 'Must be a 4-digit year')
      .refine((val) => {
        const num = Number(val);
        return num >= currentYear && num <= 2100;
      }, { message: `Graduation year must be between ${currentYear} and 2100` }),
    z.literal('Graduate'),
  ]),
  bio: z.string().min(1, 'Bio is required').max(500, 'Bio must be less than 500 characters'),
  tags: z.array(z.string()).min(1, 'Add at least one interest').max(5, 'Maximum 5 interests allowed'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile;
  onCancel?: () => void;
  onSubmit: (data: Profile, isDirty: boolean) => Promise<void>;
  isFirstTime?: boolean;
}

const ProfileForm = ({ profile, onCancel, onSubmit, isFirstTime = false }: ProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: profile ? {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      major: profile.major,
      year: String(profile.year),
      bio: profile.bio,
      tags: profile.tags || [],
    } : undefined,
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
  });

  const tags = watch('tags');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()], { shouldDirty: true });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldDirty: true });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    console.log('Form submitted: ', data);
    try {
      if (onSubmit) {
        await onSubmit(data as Profile, isDirty);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save profile data");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">
        {isFirstTime ? 'Complete Your Profile' : 'Edit Your Profile'}
      </h2>
      {isFirstTime && (
        <p className="text-sm text-slate-600 mb-6">
          Tell us about yourself so other students can find you
        </p>
      )}

      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="space-y-4"
      >
        {/* Hidden ID field */}
        <input type="hidden" {...register('id')} />

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Full Name</span>
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
          <span className="text-sm font-semibold text-gray-700">Major</span>
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
          <span className="text-sm font-semibold text-gray-700">Graduation Year</span>
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
          <span className="text-sm font-semibold text-gray-700">Interests</span>
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
          {errors.tags && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.tags.message}
            </span>
          )}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
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
            {isSubmitting ? 'Saving...' : isFirstTime ? 'Create Profile' : 'Save Changes'}
          </button>
        </div>
      </form>

      {submitError && (
        <div className="mt-4 text-red-600 font-medium">
          {submitError}
        </div>
      )}
    </div>
  );
};

export default ProfileForm;