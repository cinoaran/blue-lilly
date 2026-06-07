export function dataUrlToFile(dataUrl: string, filename: string): File {
  // Nur gültige image Data-URLs erlauben
  if (!dataUrl.startsWith("data:image/") || !dataUrl.includes(";base64,")) {
    throw new Error("Invalid image data URL");
  }

  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:([a-zA-Z0-9/+.-]+);base64/);

  if (!mimeMatch) {
    throw new Error("Invalid data URL format");
  }

  const mimeType = mimeMatch[1]; // image/webp, image/png, image/jpeg etc.

  // Optional: Nur bestimmte Formate erlauben
  const allowedTypes = [
    // Images
    "image/webp",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    // Videos
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
  ];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`);
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, {type: mimeType});
}
