import { Readable } from 'stream';

export interface StorageProvider {
  saveFile(key: string, buffer: Buffer, mimeType?: string): Promise<void>;
  getFileStream(key: string): Promise<Readable>;
  getFileBuffer(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  fileExists(key: string): Promise<boolean>;
}
