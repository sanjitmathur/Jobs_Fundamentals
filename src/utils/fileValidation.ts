import path from 'path';
import { AppError } from './AppError';

export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export function getMaxFileSize(): number {
  if (process.env.MAX_FILE_SIZE_BYTES) {
    const parsed = parseInt(process.env.MAX_FILE_SIZE_BYTES, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_MAX_FILE_SIZE;
}

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt', '.text', '.log'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/zip': ['.zip'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export function sanitizeFilename(filename: string): string {
  let clean = filename.replace(/[\x00-\x1F\x7F]/g, '');
  clean = path.basename(clean);
  clean = clean.replace(/^\.+/, '');
  if (!clean || clean.trim().length === 0) {
    clean = 'unnamed_file';
  }
  return clean;
}

export function detectMimeTypeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length < 4) {
    return null;
  }

  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return 'application/pdf';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return 'application/zip';
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 &&
    buffer[5] === 0xb1 &&
    buffer[6] === 0x1a &&
    buffer[7] === 0xe1
  ) {
    return 'application/msword';
  }

  return null;
}

export function isTextContent(buffer: Buffer): boolean {
  const checkLength = Math.min(buffer.length, 1024);
  for (let i = 0; i < checkLength; i++) {
    const byte = buffer[i];
    if (byte === 0 || (byte < 7 && byte !== 0) || (byte > 13 && byte < 32)) {
      return false;
    }
  }
  return true;
}

export const BINARY_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function validateUploadedFile(file: {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}): { validatedMimeType: string; sanitizedOriginalName: string } {
  if (!file) {
    throw new AppError('File is required', 400);
  }

  if (!file.buffer || file.size === 0 || file.buffer.length === 0) {
    throw new AppError('File cannot be empty', 400);
  }

  const maxFileSize = getMaxFileSize();
  if (file.size > maxFileSize) {
    throw new AppError(`File size exceeds maximum allowed limit of ${maxFileSize / (1024 * 1024)}MB`, 400);
  }

  let declaredMime = (file.mimetype || '').toLowerCase().trim();
  const sanitizedOriginalName = sanitizeFilename(file.originalname);
  const ext = path.extname(sanitizedOriginalName).toLowerCase();

  if (!declaredMime || declaredMime === 'application/octet-stream') {
    for (const [mime, exts] of Object.entries(ALLOWED_MIME_TYPES)) {
      if (exts.includes(ext)) {
        declaredMime = mime;
        break;
      }
    }
  }

  const allowedExtensions = ALLOWED_MIME_TYPES[declaredMime];
  if (!allowedExtensions) {
    throw new AppError(`Unsupported file type: ${declaredMime || 'unknown'}`, 400);
  }

  if (!allowedExtensions.includes(ext)) {
    const isDocxZip =
      ext === '.docx' &&
      (declaredMime === 'application/zip' ||
        declaredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    if (!isDocxZip) {
      throw new AppError(
        `File extension ${ext || '(none)'} does not match allowed types for ${declaredMime}`,
        400
      );
    }
  }

  const detectedMime = detectMimeTypeFromBuffer(file.buffer);

  if (BINARY_MIME_TYPES.has(declaredMime)) {
    if (!detectedMime) {
      throw new AppError(
        `File signature mismatch: content does not match declared type ${declaredMime}`,
        400
      );
    }

    const isDocx =
      ext === '.docx' &&
      declaredMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      detectedMime === 'application/zip';

    if (detectedMime !== declaredMime && !isDocx) {
      throw new AppError(
        `File signature mismatch: content detected as ${detectedMime}, but declared as ${declaredMime}`,
        400
      );
    }

    return { validatedMimeType: declaredMime, sanitizedOriginalName };
  }

  if (['text/plain', 'text/csv', 'application/json'].includes(declaredMime)) {
    if (detectedMime) {
      throw new AppError(
        `File signature mismatch: binary signature (${detectedMime}) detected for text file`,
        400
      );
    }

    if (!isTextContent(file.buffer)) {
      throw new AppError(`File signature mismatch: binary content found in text file`, 400);
    }

    if (declaredMime === 'application/json') {
      try {
        JSON.parse(file.buffer.toString('utf-8'));
      } catch {
        throw new AppError(`Invalid JSON content`, 400);
      }
    }

    return { validatedMimeType: declaredMime, sanitizedOriginalName };
  }

  return { validatedMimeType: declaredMime, sanitizedOriginalName };
}
