import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import ProfileForm from './UserProfile';
import { type Profile } from '../types/Profile';

/**
 * UserProfile Component Description:
 * 
 * The UserProfile component is a dual-mode profile management component that allows users to:
 * 1. VIEW their profile information in a read-only display mode
 * 2. EDIT their profile information through a comprehensive form
 * 
 * Key Features:
 * - Displays profile information including name, email, major, graduation year, bio, interests, meal preferences, and availability
 * - Provides an edit mode with form validation using Zod schema
 * - Supports adding/removing interests, meal preferences, and availability slots dynamically
 * - Handles profile photo display with fallback avatar
 * - Includes LinkedIn URL validation and display
 * - Supports both first-time profile creation and profile editing workflows
 * - Form submission with error handling and loading states
 * - Keyboard shortcuts (Enter key) for adding tags
 * 
 * The component toggles between display and edit modes using the isEditing state.
 */

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn((name) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    })),
    handleSubmit: vi.fn((fn) => (e) => {
      e.preventDefault();
      return fn(mockValidProfileData);
    }),
    formState: {
      errors: {},
      isSubmitting: false,
      isDirty: false,
    },
    watch: vi.fn((field) => {
      switch (field) {
        case 'interests':
          return mockValidProfileData.interests;
        case 'availability':
          return mockValidProfileData.availability;
        case 'mealPreference':
          return mockValidProfileData.mealPreference;
        default:
          return mockValidProfileData[field as keyof Profile];
      }
    }),
    setValue: vi.fn(),
  }),
}));

// Mock data
const mockValidProfileData: Profile = {
  id: '12345',
  name: 'John Doe',
  email: 'john.doe@northwestern.edu',
  major: 'Computer Science',
  year: '2025',
  bio: 'I am a computer science student interested in software development.',
  interests: ['Programming', 'Basketball'],
  availability: ['Monday 9-11 AM', 'Wednesday 2-4 PM'],
  mealPreference: ['Vegetarian', 'No nuts'],
  photoUrl: 'https://example.com/photo.jpg',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
};

const mockInvalidProfileData: Profile = {
  id: '',
  name: 'J',
  email: 'invalid-email',
  major: '',
  year: 'invalid-year',
  bio: '',
  interests: [],
  availability: [],
  mealPreference: [],
  photoUrl: '',
  linkedinUrl: 'invalid-linkedin-url',
};

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Mode', () => {
    it('renders profile information correctly in display mode', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      // Check if profile information is displayed
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Computer Science • 2025')).toBeInTheDocument();
      expect(screen.getByText('john.doe@northwestern.edu')).toBeInTheDocument();
      expect(screen.getByText('I am a computer science student interested in software development.')).toBeInTheDocument();
      
      // Check interests are displayed
      expect(screen.getByText('Programming')).toBeInTheDocument();
      expect(screen.getByText('Basketball')).toBeInTheDocument();
      
      // Check meal preferences are displayed
      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
      expect(screen.getByText('No nuts')).toBeInTheDocument();
      
      // Check availability is displayed
      expect(screen.getByText('Monday 9-11 AM')).toBeInTheDocument();
      expect(screen.getByText('Wednesday 2-4 PM')).toBeInTheDocument();
      
      // Check LinkedIn URL is displayed
      expect(screen.getByText('View LinkedIn Profile')).toBeInTheDocument();
      
      // Check Edit Profile button is present
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('displays profile photo when photoUrl is provided', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const profileImage = screen.getByAltText("John Doe's profile");
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });

    it('displays fallback avatar when photoUrl is not provided', () => {
      const profileWithoutPhoto = { ...mockValidProfileData, photoUrl: '' };
      render(
        <ProfileForm
          profile={profileWithoutPhoto}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      // Should display first letter of name as fallback
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('does not display LinkedIn section when linkedinUrl is not provided', () => {
      const profileWithoutLinkedIn = { ...mockValidProfileData, linkedinUrl: '' };
      render(
        <ProfileForm
          profile={profileWithoutLinkedIn}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.queryByText('View LinkedIn Profile')).not.toBeInTheDocument();
    });

    it('does not display interests section when interests array is empty', () => {
      const profileWithoutInterests = { ...mockValidProfileData, interests: [] };
      render(
        <ProfileForm
          profile={profileWithoutInterests}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.queryByText('Interests & Experiences')).not.toBeInTheDocument();
    });

    it('does not display meal preferences section when mealPreference array is empty', () => {
      const profileWithoutMealPrefs = { ...mockValidProfileData, mealPreference: [] };
      render(
        <ProfileForm
          profile={profileWithoutMealPrefs}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.queryByText('Meal Preference')).not.toBeInTheDocument();
    });

    it('does not display availability section when availability array is empty', () => {
      const profileWithoutAvailability = { ...mockValidProfileData, availability: [] };
      render(
        <ProfileForm
          profile={profileWithoutAvailability}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.queryByText('Availability')).not.toBeInTheDocument();
    });

    it('switches to edit mode when Edit Profile button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const editButton = screen.getByText('Edit Profile');
      await user.click(editButton);

      // Should now show edit form
      expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form correctly for first-time users', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Tell us about yourself so other students can find you')).toBeInTheDocument();
      expect(screen.getByText('Create Profile')).toBeInTheDocument();
    });

    it('renders edit form correctly for existing users', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      // Switch to edit mode
      const editButton = screen.getByText('Edit Profile');
      await user.click(editButton);

      expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('displays all form fields with correct placeholders', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));

      // Check form fields
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your.email@university.edu')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://www.linkedin.com/in/your-profile')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Computer Science')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g. 2025/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type an interest and press Enter')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Vegetarian, Vegan, Halal, Kosher')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. Monday 9-11 AM, Weekdays after 3 PM')).toBeInTheDocument();
    });

    it('email field is disabled in edit mode', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));

      const emailField = screen.getByPlaceholderText('your.email@university.edu');
      expect(emailField).toBeDisabled();
    });

    it('displays existing interests as removable tags', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));

      // Should show existing interests with remove buttons
      const programmingTag = screen.getByText('Programming').closest('div');
      const basketballTag = screen.getByText('Basketball').closest('div');
      
      expect(programmingTag).toBeInTheDocument();
      expect(basketballTag).toBeInTheDocument();
      
      // Each tag should have a remove button (×)
      const removeButtons = screen.getAllByText('×');
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('displays existing meal preferences as removable tags', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));

      expect(screen.getByText('Vegetarian')).toBeInTheDocument();
      expect(screen.getByText('No nuts')).toBeInTheDocument();
    });

    it('displays existing availability slots as removable tags', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));

      expect(screen.getByText('Monday 9-11 AM')).toBeInTheDocument();
      expect(screen.getByText('Wednesday 2-4 PM')).toBeInTheDocument();
    });
  });

  describe('Adding Tags Functionality', () => {
    it('adds new interest when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');
      const addButton = screen.getByRole('button', { name: 'Add' });

      await user.type(interestInput, 'Reading');
      await user.click(addButton);

      // setValue should have been called
      expect(interestInput).toHaveValue('');
    });

    it('adds new interest when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');

      await user.type(interestInput, 'Reading{enter}');

      expect(interestInput).toHaveValue('');
    });

    it('adds new meal preference when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const mealPrefInput = screen.getByPlaceholderText('e.g. Vegetarian, Vegan, Halal, Kosher');
      const addButtons = screen.getAllByText('Add');
      const mealPrefAddButton = addButtons[1]; // Second Add button is for meal preferences

      await user.type(mealPrefInput, 'Vegan');
      await user.click(mealPrefAddButton);

      expect(mealPrefInput).toHaveValue('');
    });

    it('adds new availability slot when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const availabilityInput = screen.getByPlaceholderText('e.g. Monday 9-11 AM, Weekdays after 3 PM');
      const addButtons = screen.getAllByText('Add');
      const availabilityAddButton = addButtons[2]; // Third Add button is for availability

      await user.type(availabilityInput, 'Friday 1-3 PM');
      await user.click(availabilityAddButton);

      expect(availabilityInput).toHaveValue('');
    });

    it('does not add empty or whitespace-only tags', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');
      const addButton = screen.getByRole('button', { name: 'Add' });

      // Try to add empty string
      await user.click(addButton);
      expect(interestInput).toHaveValue('');

      // Try to add whitespace only
      await user.type(interestInput, '   ');
      await user.click(addButton);
      expect(interestInput).toHaveValue('   ');
    });

    it('does not add duplicate interests', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');
      const addButton = screen.getByRole('button', { name: 'Add' });

      // Try to add an existing interest
      await user.type(interestInput, 'Programming');
      await user.click(addButton);

      // Input should remain filled since duplicate wasn't added
      expect(interestInput).toHaveValue('Programming');
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with profile data when form is submitted', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const submitButton = screen.getByText('Create Profile');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(mockValidProfileData, false);
    });

    it('switches back to display mode after successful submission for existing users', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);
      
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));
      
      const submitButton = screen.getByText('Save Changes');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Your Profile')).toBeInTheDocument();
      });
    });

    it('displays error message when submission fails', async () => {
      const errorMessage = 'Failed to save profile data';
      mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage));
      
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const submitButton = screen.getByText('Create Profile');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays generic error message for non-Error rejections', async () => {
      mockOnSubmit.mockRejectedValueOnce('String error');
      
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const submitButton = screen.getByText('Create Profile');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save profile data')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel button is clicked for first-time users', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isFirstTime={true}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('switches back to display mode when cancel edit is clicked for existing users', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));
      
      const cancelButton = screen.getByText('Cancel Edit');
      await user.click(cancelButton);

      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });

    it('does not call onCancel for existing users when cancel edit is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isFirstTime={false}
        />
      );

      await user.click(screen.getByText('Edit Profile'));
      await user.click(screen.getByText('Cancel Edit'));

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined profile gracefully', () => {
      // This test checks if the component can handle undefined profile
      expect(() => {
        render(
          <ProfileForm
            profile={undefined as any}
            onSubmit={mockOnSubmit}
            isFirstTime={true}
          />
        );
      }).not.toThrow();
    });

    it('handles profile with null/undefined arrays', () => {
      const profileWithNullArrays = {
        ...mockValidProfileData,
        interests: undefined as any,
        availability: undefined as any,
        mealPreference: undefined as any,
      };

      expect(() => {
        render(
          <ProfileForm
            profile={profileWithNullArrays}
            onSubmit={mockOnSubmit}
            isFirstTime={false}
          />
        );
      }).not.toThrow();
    });

    it('handles very long bio text', () => {
      const profileWithLongBio = {
        ...mockValidProfileData,
        bio: 'A'.repeat(1000), // Very long bio
      };

      render(
        <ProfileForm
          profile={profileWithLongBio}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
    });

    it('handles special characters in name', () => {
      const profileWithSpecialChars = {
        ...mockValidProfileData,
        name: "John O'Connor-Smith",
      };

      render(
        <ProfileForm
          profile={profileWithSpecialChars}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.getByText("John O'Connor-Smith")).toBeInTheDocument();
    });

    it('handles empty strings in arrays', () => {
      const profileWithEmptyStrings = {
        ...mockValidProfileData,
        interests: ['', 'Programming', ''],
        availability: ['Monday 9-11 AM', ''],
      };

      render(
        <ProfileForm
          profile={profileWithEmptyStrings}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.getByText('Programming')).toBeInTheDocument();
      expect(screen.getByText('Monday 9-11 AM')).toBeInTheDocument();
    });

    it('handles LinkedIn URL without protocol', () => {
      const profileWithLinkedInNoProtocol = {
        ...mockValidProfileData,
        linkedinUrl: 'linkedin.com/in/johndoe',
      };

      render(
        <ProfileForm
          profile={profileWithLinkedInNoProtocol}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const linkedInLink = screen.getByText('View LinkedIn Profile');
      expect(linkedInLink.closest('a')).toHaveAttribute('href', 'https://linkedin.com/in/johndoe');
    });

    it('handles LinkedIn URL with protocol', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const linkedInLink = screen.getByText('View LinkedIn Profile');
      expect(linkedInLink.closest('a')).toHaveAttribute('href', 'https://linkedin.com/in/johndoe');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports Enter key for adding interests', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');
      
      await user.type(interestInput, 'Photography');
      await user.keyboard('{Enter}');

      expect(interestInput).toHaveValue('');
    });

    it('supports Enter key for adding meal preferences', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const mealPrefInput = screen.getByPlaceholderText('e.g. Vegetarian, Vegan, Halal, Kosher');
      
      await user.type(mealPrefInput, 'Gluten-free');
      await user.keyboard('{Enter}');

      expect(mealPrefInput).toHaveValue('');
    });

    it('supports Enter key for adding availability', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const availabilityInput = screen.getByPlaceholderText('e.g. Monday 9-11 AM, Weekdays after 3 PM');
      
      await user.type(availabilityInput, 'Saturday 10-12 PM');
      await user.keyboard('{Enter}');

      expect(availabilityInput).toHaveValue('');
    });

    it('prevents form submission when Enter is pressed in tag inputs', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      const interestInput = screen.getByPlaceholderText('Type an interest and press Enter');
      
      await user.type(interestInput, 'Photography{Enter}');

      // onSubmit should not have been called (form shouldn't submit)
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form fields', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={true}
        />
      );

      // Check for proper labels
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/LinkedIn Profile/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Major/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Graduation Year/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Interests/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Meal Preferences/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Availability/i)).toBeInTheDocument();
    });

    it('has proper button roles and accessible names', async () => {
      const user = userEvent.setup();
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
      
      await user.click(screen.getByText('Edit Profile'));
      
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel Edit' })).toBeInTheDocument();
    });

    it('has proper alt text for profile image', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const profileImage = screen.getByAltText("John Doe's profile");
      expect(profileImage).toBeInTheDocument();
    });

    it('has proper link attributes for LinkedIn URL', () => {
      render(
        <ProfileForm
          profile={mockValidProfileData}
          onSubmit={mockOnSubmit}
          isFirstTime={false}
        />
      );

      const linkedInLink = screen.getByText('View LinkedIn Profile').closest('a');
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});