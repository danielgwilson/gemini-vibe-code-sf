import { experimental_generateImage as generateImage } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    const result = await generateImage({
      model: myProvider.imageModel('image-model'),
      prompt: title,
      aspectRatio: '1:1',
    });
    const image = result.image as unknown as string | Uint8Array | Blob | File;

    // Convert image to base64 if it's a URL
    let imageBase64 = '';
    if (typeof image === 'string') {
      // If it's already a base64 string or data URL, extract the base64 part
      if (image.startsWith('data:')) {
        imageBase64 = image.split(',')[1] || image;
      } else if (image.startsWith('http')) {
        // Fetch the image and convert to base64
        const response = await fetch(image);
        const buffer = await response.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      } else {
        imageBase64 = image;
      }
    } else if (image instanceof Uint8Array) {
      imageBase64 = Buffer.from(image).toString('base64');
    } else if (
      image &&
      typeof image === 'object' &&
      'arrayBuffer' in image &&
      typeof image.arrayBuffer === 'function'
    ) {
      // If it's a Blob or File, convert to base64
      const buffer = await image.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    } else {
      throw new Error(`Unsupported image type: ${typeof image}`);
    }

    // Stream the image data
    dataStream.write({
      type: 'data-imageDelta',
      data: imageBase64,
      transient: true,
    });

    return imageBase64;
  },
  onUpdateDocument: async ({
    document: _document,
    description,
    dataStream,
  }) => {
    // For updates, generate a new image based on the description
    const result = await generateImage({
      model: myProvider.imageModel('image-model'),
      prompt: description,
      aspectRatio: '1:1',
    });
    const image = result.image as unknown as string | Uint8Array | Blob | File;

    // Convert image to base64
    let imageBase64 = '';
    if (typeof image === 'string') {
      if (image.startsWith('data:')) {
        imageBase64 = image.split(',')[1] || image;
      } else if (image.startsWith('http')) {
        const response = await fetch(image);
        const buffer = await response.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      } else {
        imageBase64 = image;
      }
    } else if (image instanceof Uint8Array) {
      imageBase64 = Buffer.from(image).toString('base64');
    } else if (
      image &&
      typeof image === 'object' &&
      'arrayBuffer' in image &&
      typeof image.arrayBuffer === 'function'
    ) {
      const buffer = await image.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString('base64');
    } else {
      throw new Error(`Unsupported image type: ${typeof image}`);
    }

    // Stream the image data
    dataStream.write({
      type: 'data-imageDelta',
      data: imageBase64,
      transient: true,
    });

    return imageBase64;
  },
});
