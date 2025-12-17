import { apiPost, apiPatch } from './api-client';

interface UploadUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
}

interface ProfilePictureUpdateResponse {
  profilePictureUrl: string;
}

/**
 * Profile picture service for uploading and managing user avatars
 */
export const profileService = {
  /**
   * Get presigned S3 URL for uploading a profile picture
   */
  async getUploadUrl(fileType: string, fileName: string): Promise<UploadUrlResponse> {
    const response = await apiPost<UploadUrlResponse>('/v1/me/profile-picture/upload-url', {
      fileType,
      fileName,
    });

    if (!response.data) {
      throw new Error('Failed to get upload URL');
    }

    return response.data;
  },

  /**
   * Upload file to S3 using presigned URL
   */
  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  },

  /**
   * Update user's profile picture URL in the database
   */
  async updateProfilePictureUrl(imageUrl: string): Promise<string> {
    const response = await apiPatch<ProfilePictureUpdateResponse>(
      '/v1/me/profile-picture',
      { imageUrl }
    );

    if (!response.data) {
      throw new Error('Failed to update profile picture');
    }

    return response.data.profilePictureUrl;
  },

  /**
   * Complete profile picture upload workflow:
   * 1. Get presigned URL
   * 2. Upload to S3
   * 3. Update user record
   */
  async uploadProfilePicture(file: File): Promise<string> {
    // Step 1: Get presigned URL
    const { uploadUrl, imageUrl } = await this.getUploadUrl(file.type, file.name);

    // Step 2: Upload to S3
    await this.uploadToS3(uploadUrl, file);

    // Step 3: Update user record
    await this.updateProfilePictureUrl(imageUrl);

    return imageUrl;
  },

  /**
   * Remove profile picture
   */
  async removeProfilePicture(): Promise<void> {
    await this.updateProfilePictureUrl('');
  },
};
