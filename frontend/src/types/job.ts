import { JobFile } from './file';
import { PaginatedResponse } from './api';

export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Job {
  id: string;
  title: string;
  description?: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  files?: JobFile[];
}

export type JobListResponse = PaginatedResponse<Job>;

export interface CreateJobInput {
  title: string;
  description?: string;
  status?: JobStatus;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
}

export interface JobFilterParams {
  status?: string;
  page?: number;
  limit?: number;
}
