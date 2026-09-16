export const MAX_COVER_SIZE = 10 * 1024 * 1024;

export function identifyCover(data) {
  if (!data.length || data.length > MAX_COVER_SIZE) {
    throw new Error("封面不能为空，且不能超过 10 MB");
  }
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => data[i] === byte)) {
    return { mediaType: "image/png", extension: "png" };
  }
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) {
    return { mediaType: "image/jpeg", extension: "jpg" };
  }
  throw new Error("请选择 JPG 或 PNG 格式的封面图片");
}

export async function readCover(file) {
  if (!file.size || file.size > MAX_COVER_SIZE) {
    throw new Error("封面不能为空，且不能超过 10 MB");
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const format = identifyCover(data);
  const previewUrl = URL.createObjectURL(new Blob([data], { type: format.mediaType }));
  try {
    const image = new Image();
    image.src = previewUrl;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("无效图片");
    return { name: file.name, data, ...format, previewUrl };
  } catch {
    URL.revokeObjectURL(previewUrl);
    throw new Error("无法读取封面图片，请选择有效的 JPG 或 PNG 文件");
  }
}
