import { useState, useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export function ProfilePictureUpload({
  currentImageUrl,
  userName,
  onUpload,
  onRemove,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WebP image';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      await onUpload(file);
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    const confirmed = confirm('Are you sure you want to remove your profile picture?');
    if (!confirmed) return;

    setIsUploading(true);
    try {
      await onRemove();
      setPreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview with Overlay */}
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar src={displayUrl} name={userName} size="xl" />

        {/* Hover Overlay */}
        {isHovered && !isUploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-all duration-200">
            <div className="text-center">
              <svg
                className="w-8 h-8 text-white mx-auto mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs text-white font-medium">
                {displayUrl ? 'Change Photo' : 'Upload Photo'}
              </span>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-8 h-8 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-xs text-white font-medium mt-1">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {displayUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {displayUrl && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-slate-400 hover:text-red-400"
          >
            Remove
          </Button>
        )}
      </div>

      {/* File Requirements */}
      <p className="text-xs text-slate-500 text-center">
        JPG, PNG or WebP. Max 5MB.
      </p>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
