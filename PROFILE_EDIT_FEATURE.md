# Profile Edit Feature

## Overview

A comprehensive profile editing page that allows users to update their profile information, manage privacy settings, and upload cover photos. The design mirrors the existing profile layout for consistency.

## Features

### 1. **Profile Information Tab**

- **Profile Picture Upload**: Users can upload/change their profile picture with a dedicated image upload area
- **Cover Photo Upload**: Hover over the cover area to change it with an intuitive camera icon button
- **Basic Information**:
  - Name field (editable)
  - Email field (read-only for security)
- **Bio & Location**:
  - Bio section (textarea with 160 character limit)
  - Country field
  - Address field

### 2. **Privacy & Settings Tab**

- **Profile Visibility**:
  - Make profile public
  - Show online status
  - Show last seen
- **Messages & Calls**:
  - Allow messages from anyone
  - Allow incoming calls
  - Show read receipts

### 3. **Technical Features**

- **Form Management**: Uses React Hook Form for efficient form state management
- **Image Upload**: Integrates with Cloudinary for image hosting
- **Real-time Preview**: Shows image previews before saving
- **Dirty State Tracking**: Save button only enabled when changes are made
- **Loading States**: Visual feedback during image upload and form submission
- **Error Handling**: Toast notifications for success/error messages
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Smooth transitions using Framer Motion

## File Structure

```
Aura-Trip-Frontend/
├── src/
│   └── app/
│       └── (withDashbroadLayout)/
│           ├── (user-dashbroad)/
│           │   └── profile/
│           │       └── edit/
│           │           └── page.tsx           # Page component
│           └── _component/
│               └── module/
│                   └── profileEdit/
│                       └── index.tsx          # Main edit component
```

## Usage

### Accessing the Edit Profile Page

1. **From Profile Page**: Click the edit button (pencil icon) in the top-right corner of the profile
2. **From Settings**: Click "Edit Profile" button in the settings page
3. **Direct Navigation**: Navigate to `/profile/edit`

### Updating Profile Information

1. Go to the **Profile Info** tab
2. Update desired fields:
   - Upload a new profile picture by clicking the upload area
   - Upload a new cover photo by hovering over the cover image
   - Edit name, bio, country, and address
3. Click **Save Changes** to save all changes

### Managing Privacy Settings

1. Go to the **Privacy & Settings** tab
2. Toggle privacy options as needed:
   - Profile visibility controls
   - Online status and last seen options
   - Message and call preferences
   - Read receipt settings
3. Click **Save Changes** to save privacy preferences

## Component Props

### ProfileEditPage (Main Component)

No props required - uses `useUser` hook to get current user information.

## Integration Points

### Redux API

- `useUpdateMyProfileMutation`: Handles profile update API calls
- `useGetSingleUserQuery`: Already used in profile display

### Hooks

- `useUser`: Gets current user information
- `useRouter`: Navigation after successful update
- `useForm`: React Hook Form for form management

### UI Components (NextUI)

- Button
- Input
- Card
- CardBody
- CardHeader
- Avatar
- Switch
- Divider
- Textarea

## Data Flow

1. **Initial Load**:

   - Component fetches user data from `useUser` hook
   - Form is initialized with current user values
   - Images are displayed as previews

2. **User Interaction**:

   - Form values update in real-time
   - File inputs create object URLs for preview
   - Dirty state tracks changes

3. **Form Submission**:
   - Images are uploaded to Cloudinary
   - Updated profile data is sent to backend
   - Success notification and redirect to profile page
   - Error handling with toast messages

## Styling

- **Color Scheme**: Sage theme matching the app
- **Dark Mode**: Full dark mode support
- **Responsive**: Mobile-first design with breakpoints at sm, md
- **Animations**: Staggered animations on tab content using Framer Motion

## Environment Variables Required

```env
NEXT_PUBLIC_CLOUDINARY_URL=your_cloudinary_upload_url
```

## Future Enhancements

1. **Email Verification**: Add verification step if email is ever allowed to change
2. **Profile Completion**: Show profile completion percentage
3. **Verification Badge**: Direct path to verification process
4. **Undo Changes**: Option to undo unsaved changes
5. **Field Validation**: Enhanced validation for all fields
6. **Crop Images**: Image cropping tool before upload
7. **Activity Log**: Track profile edit history
8. **Notification Preferences**: Link to detailed notification settings

## Accessibility

- All form inputs have associated labels
- Proper ARIA attributes on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG standards
- Loading states provide visual and semantic feedback

## Security Considerations

- Email is read-only to prevent unauthorized changes
- File upload validation on client-side
- File type restrictions (image/\* only)
- Proper error handling to prevent information leakage
