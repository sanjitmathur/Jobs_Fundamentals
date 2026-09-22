import { apiClient } from './client';
import { CreateJobInput, Job, JobFilterParams, JobListResponse, JobStatus, UpdateJobInput } from '../../types/job';

export async function getJobsApi(params: JobFilterParams = {}): Promise<JobListResponse> {
  return apiClient<JobListResponse>('/tasks', {
    method: 'GET',
    params: {
      status: params.status && params.status !== 'ALL' ? params.status : undefined,
      page: params.page,
      limit: params.limit,
    },
  });
}

export async function getJobByIdApi(id: string): Promise<Job> {
  return apiClient<Job>(`/tasks/${id}`, {
    method: 'GET',
  });
}

export async function createJobApi(input: CreateJobInput): Promise<Job> {
  return apiClient<Job>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateJobApi(id: string, input: UpdateJobInput): Promise<Job> {
  return apiClient<Job>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function updateJobStatusApi(id: string, status: JobStatus): Promise<Job> {
  return apiClient<Job>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteJobApi(id: string): Promise<void> {
  return apiClient<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}
