import { apiClient, getStoredToken } from './client';
import { JobFile } from '../../types/file';
import { API_BASE_URL } from '../constants';

export async function getJobFilesApi(jobId: string): Promise<JobFile[]> {
  return apiClient<JobFile[]>(`/tasks/${jobId}/files`, {
    method: 'GET',
  });
}

export async function uploadSingleFileApi(jobId: string, file: File): Promise<JobFile> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<JobFile>(`/tasks/${jobId}/files`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadMultipleFilesApi(jobId: string, files: File[]): Promise<JobFile[]> {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append('files', f);
  });

  return apiClient<JobFile[]>(`/tasks/${jobId}/files/batch`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteFileApi(jobId: string, fileId: string): Promise<void> {
  return apiClient<void>(`/tasks/${jobId}/files/${fileId}`, {
    method: 'DELETE',
  });
}

export async function downloadFileApi(jobId: string, fileId: string, fallbackFilename = 'download'): Promise<void> {
  const token = getStoredToken();
  const url = `${API_BASE_URL}/tasks/${jobId}/files/${fileId}/download`;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Download failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const disposition = response.headers.get('content-disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, '');
    }
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}
