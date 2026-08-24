// ==========================================================================
// CODE MEETS AI - SECURE SERVER-SIDE IMAGEKIT API HANDLER
// ==========================================================================
// NEVER expose IMAGEKIT_PRIVATE_KEY to browser / client JS.
// This module runs ONLY on the Node/Vite backend server.
// ==========================================================================

import crypto from 'crypto';

const getPrivateKey = () => {
  return process.env.IMAGEKIT_PRIVATE_KEY || 'private_BSNkTDg+vq6eboXvrkDevE9+XMk=';
};

/**
 * Generate client upload signature & auth token
 */
export function generateAuthParams() {
  const privateKey = getPrivateKey();
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 1800; // 30 mins

  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return { token, expire, signature };
}

/**
 * Uploads an image buffer / base64 / file directly from backend to ImageKit
 */
export async function uploadToImageKit({ fileBuffer, base64Data, fileName, folder }) {
  const privateKey = getPrivateKey();
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

  const formData = new FormData();

  if (fileBuffer) {
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);
  } else if (base64Data) {
    formData.append('file', base64Data);
  }

  formData.append('fileName', fileName || `submission_${Date.now()}.png`);
  formData.append('folder', folder || '/code-meets-ai/layer-1/gen-ai/');
  formData.append('useUniqueFileName', 'true');

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to upload image to ImageKit');
  }

  return {
    fileId: data.fileId,
    name: data.name,
    url: data.url,
    thumbnailUrl: data.thumbnailUrl || data.thumbnail || data.url,
    filePath: data.filePath,
    size: data.size
  };
}

/**
 * Deletes files from ImageKit by file IDs (used when participant is force-deleted)
 */
export async function deleteFromImageKit(fileIds = []) {
  if (!fileIds || fileIds.length === 0) return { success: true };

  const privateKey = getPrivateKey();
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

  try {
    const response = await fetch('https://api.imagekit.io/v1/files/batch/deleteByFileIds', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileIds })
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err) {
    console.warn('[ImageKit Server] Delete error:', err);
    return { success: false, error: err.message };
  }
}
