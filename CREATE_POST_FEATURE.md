# Aura Trip - Facebook-Inspired Post Creation Feature

## Overview

This document describes the redesigned post creation experience inspired by Facebook's Create Post interface. The implementation provides a professional split-screen layout for desktop and an optimized full-screen experience for mobile devices.

## Implementation Details

### Component Architecture

```
CreatePost/
├── CreatePostModal.tsx         # Main modal wrapper with responsive detection
├── CreatePostTrigger.tsx       # Trigger button that opens the modal
├── CreatePostDesktop.tsx       # Desktop split-screen layout
├── CreatePostMobile.tsx        # Mobile full-screen layout
├── TextEditor.tsx              # Rich text editor (React Quill)
├── MediaUploadZone.tsx         # Drag-and-drop media upload
├── PostPreview.tsx             # Live preview component
└── index.ts                    # Barrel export
```

### Features Implemented

#### Desktop Experience (Split Screen)

- **Left Panel (45% width)**:
  - User profile header with avatar and name
  - Title input field
  - Rich text editor with formatting toolbar
  - Media upload zone with drag-and-drop support
  - Media layout selector (Auto, Split, Feature, Grid, Mosaic)
  - Post settings:
    - Audience selector (Public/Premium)
    - Category selection
    - AI-generated content label toggle
  - Post button (sticky footer)

- **Right Panel (55% width)**:
  - Live preview of the post
  - Updates in real-time as user types
  - Shows exactly how the post will appear in the feed
  - Displays selected images with chosen layout
  - Empty state when no content is present

#### Mobile Experience (Full Screen)

- Header with close and preview buttons
- User profile section
- Title input
- Rich text editor
- Media upload
- Layout selector (when multiple images)
- Post settings (collapsible)
- Sticky post button at bottom
- Dedicated preview screen (toggle view)

### Key Features

1. **Real-time Preview**: Desktop view shows live preview while editing
2. **Media Upload**:
   - Drag and drop support
   - Multiple image selection
   - Image preview thumbnails
   - Remove individual images
   - Upload progress feedback
3. **Rich Text Editing**: React Quill with formatting options
4. **Responsive Design**: Automatically switches between desktop and mobile layouts
5. **Validation**: Post button disabled until content is added
6. **Media Layouts**: Support for Auto, Split, Feature, Grid, and Mosaic layouts
7. **Theme Support**: Works with light/dark mode

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: NextUI v2
- **Form Management**: React Hook Form
- **Rich Text**: React Quill
- **State Management**: Redux Toolkit
- **API**: RTK Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Files Modified

1. `Aura-Trip-Frontend/src/app/(withDashbroadLayout)/_component/modal/postingModal.tsx`
   - Simplified to use new CreatePostModal component

### Files Created

1. `Aura-Trip-Frontend/src/components/ui/CreatePost/CreatePostModal.tsx`
2. `Aura-Trip-Frontend/src/components/ui/CreatePost/CreatePostTrigger.tsx`
3. `Aura-Trip-Frontend/src/components/ui/CreatePost/CreatePostDesktop.tsx`
4. `Aura-Trip-Frontend/src/components/ui/CreatePost/CreatePostMobile.tsx`
5. `Aura-Trip-Frontend/src/components/ui/CreatePost/TextEditor.tsx`
6. `Aura-Trip-Frontend/src/components/ui/CreatePost/MediaUploadZone.tsx`
7. `Aura-Trip-Frontend/src/components/ui/CreatePost/PostPreview.tsx`
8. `Aura-Trip-Frontend/src/components/ui/CreatePost/index.ts`
9. `Aura-Trip-Frontend/src/hooks/useMediaQuery.ts`

## Backend Compatibility

The implementation uses the existing backend API:

- **Endpoint**: `POST /posts`
- **Service**: `useCreatePostMutation` from Redux
- **Upload**: Cloudinary integration via `uploadToCloudinary` utility

All existing post creation functionality is preserved:

- Image uploads
- Category selection
- Post status (Free/Premium)
- Media layout selection
- Post validation

## Usage

### Basic Usage

```tsx
import PostModal from "@/src/app/(withDashbroadLayout)/_component/modal/postingModal";
import { TUser } from "@/src/types";

function MyComponent() {
  const userInfo: TUser = // ... get user info

  return <PostModal userInfo={userInfo} />;
}
```

### Direct Component Usage

```tsx
import { CreatePostModal } from "@/src/components/ui/CreatePost";

function MyComponent() {
  return <CreatePostModal userInfo={userInfo} />;
}
```

## Customization

### Theme Customization

The component uses Aura Trip's design tokens:

- `--brand-primary`: Primary sage green color
- `--surface`: Card/surface backgrounds
- `--app-background`: Page background
- `--text-main`: Primary text color
- `--text-secondary`: Secondary text color
- `--border-color`: Border colors

These are defined in `tailwind.config.js` and `globals.css`.

### Adding New Features

To add new creation options (e.g., tagging, location, feeling):

1. Add field to `PostFormData` interface in `CreatePostModal.tsx`
2. Add UI control in both Desktop and Mobile components
3. Update form submission logic
4. Ensure backend supports the new field

## Testing Checklist

- [ ] Desktop: Create text-only post
- [ ] Desktop: Create post with single image
- [ ] Desktop: Create post with multiple images
- [ ] Desktop: Test all media layout options
- [ ] Desktop: Live preview updates in real-time
- [ ] Mobile: Create post in full-screen mode
- [ ] Mobile: Toggle preview view
- [ ] Mobile: Upload images
- [ ] Drag and drop images (desktop)
- [ ] Remove images from upload
- [ ] Rich text formatting works
- [ ] Category selection
- [ ] Audience selection (Public/Premium)
- [ ] AI label toggle
- [ ] Validation (post button disabled without content)
- [ ] Image upload to Cloudinary
- [ ] Post creation success
- [ ] Error handling
- [ ] Light/dark theme compatibility
- [ ] Responsive breakpoints

## Known Limitations

1. **Advanced Features Not Yet Implemented**:
   - People tagging
   - Location/check-in
   - Feeling/activity
   - GIF picker
   - Share to Groups
   - Share to Story
   - Post scheduling
   - Monetization options

2. **Future Enhancements**:
   - Video upload support
   - Emoji picker integration
   - Poll creation
   - Event creation
   - Background colors/patterns
   - Post drafts
   - Collaborative posts

## Performance Considerations

- Images are only uploaded on form submission (not during selection)
- Preview images use object URLs (no unnecessary uploads)
- React Quill is loaded dynamically to reduce bundle size
- Media query hook optimized for SSR
- Form validation is memoized

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus management in modals
- Screen reader friendly
- Touch-friendly mobile controls
- Safe area support for mobile devices

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

All dependencies are already installed in the project:

- `react-quill`: ^2.0.0
- `@nextui-org/*`: v2.x
- `react-hook-form`: ^7.53.0
- `lucide-react`: ^0.451.0
- `next`: 14.2.4

## Migration from Old PostModal

The old PostModal component has been replaced with a wrapper that uses the new CreatePostModal. All existing functionality is preserved, and the API remains the same.

### Breaking Changes

None. The component interface remains identical.

### Deprecations

None. All features from the old implementation are supported.

## Troubleshooting

### Issue: Preview not updating

- Check that `description` state is properly passed to PostPreview
- Verify React Quill onChange is firing

### Issue: Images not uploading

- Check Cloudinary environment variable: `NEXT_PUBLIC_CLOUDINARY_URL`
- Verify upload preset: `aura-trip`
- Check network tab for failed requests

### Issue: Mobile layout not activating

- Verify `useMediaQuery` hook is working
- Check breakpoint: `(max-width: 768px)`
- Test with browser dev tools mobile emulation

## Support

For issues or questions:

1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Test with network tab open

## Version History

- **v1.0.0** (2024): Initial Facebook-inspired redesign
  - Split-screen desktop layout
  - Full-screen mobile layout
  - Live preview
  - Rich text editing
  - Drag-and-drop media upload
