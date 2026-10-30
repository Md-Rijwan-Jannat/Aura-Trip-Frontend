# Post Creation Component - Integration Guide

## Quick Start

The new Facebook-inspired post creation modal is already integrated into your existing PostModal component. No additional setup is required!

### Current Integration

The component is used in:

```tsx
// File: src/app/(withDashbroadLayout)/_component/modal/postingModal.tsx
import { TUser } from "@/src/types";
import CreatePostModal from "@/src/components/ui/CreatePost/CreatePostModal";

const PostModal = ({ userInfo }: TPostModalProps) => {
  return <CreatePostModal userInfo={userInfo} />;
};
```

## Features Overview

### Desktop Experience

- **Two-Panel Layout**: Creation panel (45%) + Live Preview (55%)
- **Real-time Preview**: See your post as you type
- **Professional UI**: Inspired by Facebook's Create Post interface

### Mobile Experience

- **Full-Screen Mode**: Optimized for mobile devices
- **Toggle Preview**: Dedicated preview screen
- **Touch-Friendly**: Large buttons and easy navigation

## Component API

### CreatePostModal

```tsx
interface CreatePostModalProps {
  userInfo: TUser | undefined;
}

<CreatePostModal userInfo={userInfo} />;
```

**Props:**

- `userInfo`: User object containing profile information

**Features:**

- Automatic responsive detection
- Renders desktop or mobile layout based on screen size
- Manages modal state internally

### PostFormData Structure

```tsx
interface PostFormData {
  title: string; // Optional post title
  description: string; // Rich HTML content
  category: string; // Selected category
  status: string; // "FREE" | "PREMIUM"
  mediaLayout: string; // Image layout option
  tags: string[]; // Future: Tagged users
  location: string; // Future: Location/check-in
  feeling: string; // Future: Feeling/activity
  aiGenerated: boolean; // AI content label
  shareToGroups: string[]; // Future: Group sharing
  shareToStory: boolean; // Future: Story sharing
  scheduledAt: Date | null; // Future: Scheduled posts
}
```

## Usage Examples

### Example 1: Basic Usage (Current Implementation)

```tsx
// Already working in your app
import PostModal from "@/src/app/(withDashbroadLayout)/_component/modal/postingModal";

function NewsFeed() {
  const { data: userInfo } = useUser();

  return (
    <div>
      <PostModal userInfo={userInfo} />
    </div>
  );
}
```

### Example 2: Direct Component Usage

```tsx
import { CreatePostModal } from "@/src/components/ui/CreatePost";

function CustomPostCreation() {
  const userInfo = useCurrentUser();

  return (
    <div className='max-w-4xl mx-auto'>
      <CreatePostModal userInfo={userInfo} />
    </div>
  );
}
```

### Example 3: Trigger Only

```tsx
import { CreatePostTrigger } from "@/src/components/ui/CreatePost";

function CustomTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return <CreatePostTrigger userInfo={userInfo} onOpen={() => setIsOpen(true)} />;
}
```

## Customization

### Theme Customization

The component uses your existing theme tokens:

```css
/* globals.css */
:root {
  --brand-primary: #2f7d62; /* Sage green */
  --surface: #ffffff;
  --app-background: #f7faf7;
  --text-main: #000000;
  --text-secondary: #666666;
  --border-color: #e5e5e5;
}

.dark {
  --brand-primary: #65a982;
  --surface: #1a1a1a;
  --app-background: #121614;
  --text-main: #ffffff;
  --text-secondary: #a0a0a0;
  --border-color: #333333;
}
```

### Extending Features

#### Adding Location Feature

1. **Update Form State:**

```tsx
// In CreatePostDesktop.tsx and CreatePostMobile.tsx
const [location, setLocation] = useState("");
```

2. **Add UI Control:**

```tsx
<button
  type='button'
  onClick={() => setShowLocationPicker(true)}
  className='w-full flex items-center gap-3 p-3 rounded-lg hover:bg-default-100'
>
  <MapPin className='w-5 h-5 text-primaryColor' />
  <span>Add location</span>
</button>
```

3. **Include in Submission:**

```tsx
const postData = {
  ...data,
  images: uploadedImages,
  description,
  location, // Added
};
```

#### Adding People Tagging

```tsx
// Add to form
const [taggedUsers, setTaggedUsers] = useState<string[]>([]);

// UI component
<UserSearchAndTag onUsersSelected={(users) => setTaggedUsers(users)} selectedUsers={taggedUsers} />;

// Include in preview
{
  taggedUsers.length > 0 && <div className='text-sm text-textSecondary'>with {taggedUsers.map((u) => u.name).join(", ")}</div>;
}
```

## Backend Integration

### API Endpoint

```typescript
// POST /posts
{
  title: string;
  description: string;  // HTML content
  images: string[];     // Cloudinary URLs
  category: string;
  status: "FREE" | "PREMIUM";
  mediaLayout: "AUTO" | "SINGLE" | "SPLIT" | "FEATURE" | "GRID" | "MOSAIC";
}
```

### Redux Integration

```typescript
// Already configured
import { useCreatePostMutation } from "@/src/redux/features/post/postApi";

const [createPost, { isLoading }] = useCreatePostMutation();

await createPost(postData);
```

### Image Upload

```typescript
// utils/uploadCloudinary.ts
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "aura-trip");

  const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.secure_url;
}
```

## Testing Guide

### Manual Testing Checklist

#### Desktop

- [ ] Open post modal on desktop (> 768px)
- [ ] Type in title field → Preview updates
- [ ] Type in editor → Preview updates
- [ ] Upload single image → Preview shows image
- [ ] Upload multiple images → Layout selector appears
- [ ] Change layout → Preview updates
- [ ] Select category → No errors
- [ ] Toggle AI label → State changes
- [ ] Click Post → Creates post successfully
- [ ] Cancel → Modal closes without posting

#### Mobile

- [ ] Open post modal on mobile (< 768px)
- [ ] Full-screen layout displays
- [ ] Type content → Enables preview button
- [ ] Click preview → Shows preview screen
- [ ] Return from preview → Content preserved
- [ ] Upload images → Shows thumbnails
- [ ] Remove image → Works correctly
- [ ] Submit post → Success

#### Edge Cases

- [ ] Create post with no content → Button disabled
- [ ] Create post with only title → Works
- [ ] Create post with only description → Works
- [ ] Create post with only images → Works
- [ ] Upload 10+ images → Handles correctly
- [ ] Upload very large image → Progress shown
- [ ] Network error during upload → Error handled
- [ ] Close modal while uploading → Upload cancelled

### Automated Testing (Future)

```typescript
// Example test structure
describe("CreatePostModal", () => {
  it("renders trigger button", () => {});
  it("opens modal on trigger click", () => {});
  it("updates preview in real-time", () => {});
  it("uploads images successfully", () => {});
  it("submits post with correct data", () => {});
  it("handles errors gracefully", () => {});
});
```

## Troubleshooting

### Common Issues

#### Issue: Modal doesn't open

**Solution:** Check that `userInfo` is defined and not null.

#### Issue: Images not uploading

**Solution:**

1. Verify `NEXT_PUBLIC_CLOUDINARY_URL` environment variable
2. Check upload preset is "aura-trip"
3. Check network tab for failed requests

#### Issue: Preview not updating

**Solution:**

1. Ensure React Quill is loaded (check for loading spinner)
2. Verify state management in parent component
3. Check browser console for errors

#### Issue: Mobile layout on desktop

**Solution:**

1. Check `useMediaQuery` hook implementation
2. Verify breakpoint is correct (768px)
3. Test window resize

#### Issue: Styling looks different

**Solution:**

1. Check that globals.css is imported in layout
2. Verify Tailwind config includes component paths
3. Run `npm run dev` to rebuild

## Performance Optimization

### Current Optimizations

1. **Dynamic Import**: React Quill loaded on demand
2. **Object URLs**: Images use blob URLs until submission
3. **Lazy Upload**: Images uploaded only on post submission
4. **Memoization**: Form validation memoized
5. **Responsive Detection**: Single hook for media query

### Future Optimizations

```typescript
// Debounce preview updates
const debouncedDescription = useDebounce(description, 300);

// Virtual scrolling for many images
import { Virtuoso } from "react-virtuoso";

// Image compression before upload
import imageCompression from "browser-image-compression";
```

## Accessibility

### Current Features

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support
- Touch-friendly controls

### Testing

```bash
# Use axe DevTools
npm install -D @axe-core/react

# Run accessibility audit
# Check with screen reader (NVDA/JAWS/VoiceOver)
```

## Browser Compatibility

| Browser       | Version | Status             |
| ------------- | ------- | ------------------ |
| Chrome        | 90+     | ✅ Fully Supported |
| Firefox       | 88+     | ✅ Fully Supported |
| Safari        | 14+     | ✅ Fully Supported |
| Edge          | 90+     | ✅ Fully Supported |
| Mobile Safari | iOS 14+ | ✅ Fully Supported |
| Chrome Mobile | Latest  | ✅ Fully Supported |

## Migration from Old Component

### No Breaking Changes

The old `PostModal` component has been updated to use the new implementation internally. All existing code continues to work without modifications.

### Benefits

- ✅ Better UX with split-screen preview
- ✅ Mobile-optimized full-screen experience
- ✅ Improved drag-and-drop support
- ✅ Real-time preview
- ✅ Better organized code structure
- ✅ Same API, better implementation

## Support & Maintenance

### Getting Help

1. Check this integration guide
2. Review CREATE_POST_FEATURE.md for detailed docs
3. Check component source code comments
4. Test in browser dev tools

### Reporting Issues

When reporting issues, include:

- Browser and version
- Screen size (desktop/mobile)
- Steps to reproduce
- Console errors
- Network tab screenshots

## Roadmap

### Planned Features

- [ ] Video upload support
- [ ] GIF picker integration
- [ ] Emoji picker (native)
- [ ] People tagging
- [ ] Location/check-in
- [ ] Feeling/activity selector
- [ ] Poll creation
- [ ] Post scheduling
- [ ] Share to Groups
- [ ] Share to Story
- [ ] Background patterns
- [ ] Draft posts
- [ ] Collaborative posts

## Version Info

- **Current Version:** 1.0.0
- **Last Updated:** 2024
- **Dependencies:** See package.json
- **License:** Same as main project
