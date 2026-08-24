// ==========================================================================
// CODE MEETS AI - IMAGEKIT CLIENT SERVICE
// ==========================================================================
// Communicates with the secure local /api/imagekit backend endpoints.
// Never holds or touches the private key.
// ==========================================================================

export const imagekitClient = {
  /**
   * Helper to convert File object to base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload an individual image file to ImageKit via secure backend
   */
  async uploadImage(file, userId) {
    try {
      const base64Data = await this.fileToBase64(file);
      const fileName = `submission_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const folder = `/code-meets-ai/layer-1/gen-ai/${userId || 'guest'}`;

      const response = await fetch('/api/imagekit/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: base64Data,
          fileName,
          folder
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        url: data.url,
        fileId: data.fileId,
        filePath: data.filePath,
        name: data.name
      };
    } catch (err) {
      console.error('[ImageKitClient::uploadImage] Error:', err);
      throw err;
    }
  },

  /**
   * Batch upload multiple image files to ImageKit
   */
  async uploadMultipleImages(imageItems = [], userId) {
    const results = [];
    for (const item of imageItems) {
      if (item.file) {
        const uploaded = await this.uploadImage(item.file, userId);
        results.push(uploaded);
      } else if (item.url) {
        // Already uploaded / existing URL
        results.push({
          url: item.url,
          fileId: item.fileId || '',
          filePath: item.filePath || '',
          name: item.name || ''
        });
      }
    }
    return results;
  },

  /**
   * Request backend to delete files by fileIds (e.g. on user purge)
   */
  async deleteImages(fileIds = []) {
    if (!fileIds || fileIds.length === 0) return { success: true };

    try {
      const response = await fetch('/api/imagekit/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileIds })
      });

      return await response.json();
    } catch (err) {
      console.warn('[ImageKitClient::deleteImages] Error:', err);
      return { success: false, error: err.message };
    }
  }
};
