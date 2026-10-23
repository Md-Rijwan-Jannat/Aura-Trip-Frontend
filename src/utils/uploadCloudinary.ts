export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', 'aura-trip');
  formData.append('cloud_name', 'Travel-tips&-destination-guides-images');

  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;

  // Cloudinary stores audio and video under the "video" resource type; only
  // images may use the "/image/upload" endpoint baked into the env URL.
  const resourceType = file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('audio/') || file.type.startsWith('video/')
      ? 'video'
      : 'raw';
  const uploadUrl = (cloudinaryUrl ?? '').replace(
    /\/image\/upload\b/,
    `/${resourceType}/upload`,
  );

  const response = await fetch(uploadUrl || `${cloudinaryUrl}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to Cloudinary');
  }

  const data = await response.json();

  return data.secure_url;
}
