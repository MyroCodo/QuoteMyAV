# Profile Pictures Feature

## Overview
This feature allows users to upload and display custom profile pictures (avatars) throughout the QuoteMyAV application.

## Components

### Frontend Components

#### `Avatar` Component (`src/components/ui/Avatar.tsx`)
Reusable avatar component that displays either:
- User's uploaded profile picture (if available)
- Initials-based fallback with deterministic color generation

**Props:**
- `src?: string` - URL to the profile picture
- `name: string` - User's full name (used for initials)
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Avatar size (default: 'md')
- `className?: string` - Additional CSS classes

**Sizes:**
- `sm` - 32px (8rem)
- `md` - 40px (10rem) - Used in navbar
- `lg` - 56px (14rem)
- `xl` - 96px (24rem) - Used in settings/upload

**Color Generation:**
The component generates a deterministic background color based on a hash of the user's name, cycling through:
- `teal-500`
- `cyan-500`
- `emerald-500`
- `sky-500`
- `violet-500`

#### `ProfilePictureUpload` Component (`src/components/profile/ProfilePictureUpload.tsx`)
Upload interface for profile pictures with:
- Large avatar preview (xl size)
- Hover overlay with upload button
- File validation (type and size)
- Upload progress indicator
- Remove photo option

**Props:**
- `currentImageUrl?: string` - Current profile picture URL
- `userName: string` - User's name for avatar display
- `onUpload: (file: File) => Promise<void>` - Upload handler
- `onRemove?: () => Promise<void>` - Remove handler (optional)

**Validations:**
- Accepted file types: JPG, PNG, WebP
- Maximum file size: 5MB

### Backend API

#### Endpoints

**`POST /v1/me/profile-picture/upload-url`**
Generate S3 presigned URL for uploading a profile picture.

Request body:
```json
{
  "fileType": "image/jpeg",
  "fileName": "profile.jpg"
}
```

Response:
```json
{
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "imageUrl": "https://cdn.example.com/profile-pictures/user-id/123456.jpg",
    "key": "profile-pictures/user-id/123456.jpg"
  }
}
```

**`PATCH /v1/me/profile-picture`**
Update user's profile picture URL after successful upload.

Request body:
```json
{
  "imageUrl": "https://cdn.example.com/profile-pictures/user-id/123456.jpg"
}
```

Response:
```json
{
  "data": {
    "profilePictureUrl": "https://cdn.example.com/profile-pictures/user-id/123456.jpg"
  }
}
```

### Services

#### `profileService` (`src/services/profile.ts`)
Client-side service for managing profile pictures.

**Methods:**
- `getUploadUrl(fileType, fileName)` - Get S3 presigned URL
- `uploadToS3(uploadUrl, file)` - Upload file to S3
- `updateProfilePictureUrl(imageUrl)` - Update user record
- `uploadProfilePicture(file)` - Complete upload workflow (all 3 steps)
- `removeProfilePicture()` - Remove profile picture

### State Management

#### `authStore` (`src/stores/authStore.ts`)
Added `updateProfilePicture(url: string)` action to update the user's profilePictureUrl in the global auth state.

### Database Schema

#### Migration `003_add_profile_picture.sql`
Creates or updates the `users` table with:
- `id UUID PRIMARY KEY` - Matches Cognito user ID
- `profile_picture_url TEXT` - S3/CloudFront URL to profile picture
- `preferences JSONB` - For future user preferences
- `created_at`, `updated_at` - Timestamps

The endpoint uses UPSERT to handle both new and existing users.

## Upload Flow

### Production Mode (with `VITE_API_URL`)
1. User selects an image file in Settings page
2. Frontend validates file type and size
3. Frontend calls `profileService.uploadProfilePicture(file)`:
   - Step 1: Calls `POST /v1/me/profile-picture/upload-url` to get presigned S3 URL
   - Step 2: Uploads file directly to S3 using presigned URL
   - Step 3: Calls `PATCH /v1/me/profile-picture` to save URL in database
4. Frontend updates auth store with new image URL
5. Avatar components throughout the app automatically update

### Demo Mode (without `VITE_API_URL`)
1. User selects an image file in Settings page
2. Frontend validates file type and size
3. Image is converted to data URL using FileReader
4. Data URL is stored in localStorage (as part of demo-user)
5. Avatar components update immediately
6. Persists across page refreshes (when "Remember Me" is checked)

## Infrastructure Requirements

### Environment Variables
- `PROFILE_PICTURES_BUCKET` - S3 bucket name for profile pictures
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain (optional)
- `AWS_REGION` - AWS region (default: us-east-1)

### S3 Bucket Configuration
- Bucket name: `quotemyav-profile-pictures` (or custom)
- Structure: `profile-pictures/{userId}/{timestamp}.{ext}`
- CORS enabled for direct uploads from frontend
- Public read access (or serve via CloudFront)

### IAM Permissions
Lambda execution role needs:
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject"
  ],
  "Resource": "arn:aws:s3:::quotemyav-profile-pictures/*"
}
```

## Usage Examples

### Display Avatar in Navbar
```tsx
import { Avatar } from '../components/ui';
import { useAuthStore } from '../stores/authStore';

function Navbar() {
  const { user } = useAuthStore();

  return (
    <Avatar
      src={user?.profilePictureUrl}
      name={user?.fullName || 'User'}
      size="md"
    />
  );
}
```

### Profile Picture Upload in Settings
```tsx
import { ProfilePictureUpload } from '../components/profile/ProfilePictureUpload';
import { profileService } from '../services/profile';
import { useAuthStore } from '../stores/authStore';

function Settings() {
  const { user, updateProfilePicture } = useAuthStore();

  const handleUpload = async (file: File) => {
    const imageUrl = await profileService.uploadProfilePicture(file);
    await updateProfilePicture(imageUrl);
  };

  const handleRemove = async () => {
    await profileService.removeProfilePicture();
    await updateProfilePicture('');
  };

  return (
    <ProfilePictureUpload
      currentImageUrl={user?.profilePictureUrl}
      userName={user?.fullName || 'User'}
      onUpload={handleUpload}
      onRemove={handleRemove}
    />
  );
}
```

## Security Considerations

1. **File Type Validation**: Both frontend and backend validate file types
2. **File Size Limits**: 5MB maximum enforced on frontend
3. **Presigned URLs**: Expire after 5 minutes
4. **User Isolation**: Files stored in user-specific folders (`{userId}/`)
5. **Authentication**: All endpoints require valid JWT token
6. **Direct Upload**: Files uploaded directly to S3, not through backend (reduces load)

## Future Enhancements

- [ ] Image resizing/optimization on upload
- [ ] Automatic thumbnail generation
- [ ] Crop/rotate functionality
- [ ] Delete old profile pictures when new one is uploaded
- [ ] CDN cache invalidation on update
- [ ] Default avatar selection (instead of initials)
- [ ] Profile picture history/versions
