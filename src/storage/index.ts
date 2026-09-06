import { StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';

let activeStorageProvider: StorageProvider = new LocalStorageProvider();

export function getStorageProvider(): StorageProvider {
  return activeStorageProvider;
}

export function setStorageProvider(provider: StorageProvider): void {
  activeStorageProvider = provider;
}

export * from './storage.interface';
export * from './local.storage';
