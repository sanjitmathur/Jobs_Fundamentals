import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { StorageProvider } from './storage.interface';
import { AppError } from '../utils/AppError';

export class LocalStorageProvider implements StorageProvider {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = path.resolve(
      baseDir || process.env.UPLOAD_DIR || process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')
    );
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    const normalizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.resolve(this.baseDir, normalizedKey);
    const relative = path.relative(this.baseDir, fullPath);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new AppError('Invalid storage key: path traversal detected', 400);
    }

    return fullPath;
  }

  async saveFile(key: string, buffer: Buffer): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    const parentDir = path.dirname(fullPath);
    this.ensureDirectoryExists(parentDir);
    await fs.promises.writeFile(fullPath, buffer);
  }

  async getFileStream(key: string): Promise<Readable> {
    const fullPath = this.resolveSafePath(key);
    const exists = await this.fileExists(key);
    if (!exists) {
      throw new AppError('File not found in storage', 404);
    }
    return fs.createReadStream(fullPath);
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const fullPath = this.resolveSafePath(key);
    try {
      return await fs.promises.readFile(fullPath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new AppError('File not found in storage', 404);
      }
      throw err;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    try {
      await fs.promises.unlink(fullPath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async fileExists(key: string): Promise<boolean> {
    const fullPath = this.resolveSafePath(key);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  getBaseDir(): string {
    return this.baseDir;
  }
}
