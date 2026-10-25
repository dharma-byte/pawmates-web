import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/image";

type Bucket = "avatars" | "pet-photos" | "verification-photos" | "chat-images";

const PUBLIC_BUCKETS: Bucket[] = ["avatars", "pet-photos"];

// Compresses and uploads a photo to `<folder>/<random id>`. Storage policies
// only accept the user's own id (or a conversation id) as the folder.
export async function uploadImage(bucket: Bucket, folder: string, file: File) {
  const blob = await compressImage(file);
  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;

  const publicUrl = PUBLIC_BUCKETS.includes(bucket)
    ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
    : null;

  return { path, publicUrl };
}
