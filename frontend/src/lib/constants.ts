import { JobStatus } from '../types/job';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const JOB_STATUSES: { label: string; value: JobStatus; color: string; bg: string; border: string }[] = [
  {
    label: 'Pending',
    value: 'PENDING',
    color: '#d97706',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  {
    label: 'In Progress',
    value: 'IN_PROGRESS',
    color: '#0284c7',
    bg: 'rgba(14, 165, 233, 0.12)',
    border: 'rgba(14, 165, 233, 0.3)',
  },
  {
    label: 'Completed',
    value: 'COMPLETED',
    color: '#059669',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  {
    label: 'Failed',
    value: 'FAILED',
    color: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.txt',
  '.csv',
  '.json',
  '.zip',
  '.doc',
  '.docx',
];

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
