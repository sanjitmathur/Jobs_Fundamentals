export interface JobFile {
  id: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  uploadedById: string;
}

export type FileUploadResponse = JobFile | JobFile[];
