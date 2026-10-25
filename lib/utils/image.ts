// Shrinks photos in the browser before upload, to save free-tier storage
// and mobile data: longest side 1280px, then lower quality until <= 300 KB.
const MAX_BYTES = 300 * 1024;
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

function supportsWebp() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

export async function compressImage(file: File, maxSide = 1280): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That photo is too large (15 MB max).");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const type = supportsWebp() ? "image/webp" : "image/jpeg";

  try {
    let side = maxSide;
    for (let attempt = 0; attempt < 4; attempt++) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.82, 0.7, 0.6]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, type, quality),
        );
        if (blob && blob.size <= MAX_BYTES) return blob;
      }
      side = Math.round(side * 0.75);
    }
  } finally {
    bitmap.close();
  }

  throw new Error("We couldn't shrink that photo enough. Please try another one.");
}
