import sharp from "sharp";

export async function resizeAvatar(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function resizeBanner(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1500, 500, { fit: "fill" })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function resizeThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(300, 200, { fit: "fill" })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export async function compressBackground(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1500, null, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export type ImageType =
  | "avatar"
  | "banner"
  | "thumbnail"
  | "background"
  | "icon";

export async function processImage(
  buffer: Buffer,
  type: ImageType,
): Promise<Buffer> {
  switch (type) {
    case "avatar":
      return resizeAvatar(buffer);
    case "banner":
      return resizeBanner(buffer);
    case "thumbnail":
      return resizeThumbnail(buffer);
    case "background":
      return compressBackground(buffer);
    default:
      return buffer;
  }
}
