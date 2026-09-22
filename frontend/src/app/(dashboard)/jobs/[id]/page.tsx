'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job, JobStatus, UpdateJobInput } from '../../../../types/job';
import { JobFile } from '../../../../types/file';
import { getJobByIdApi, updateJobApi, updateJobStatusApi, deleteJobApi } from '../../../../lib/api/jobs';
import {
  getJobFilesApi,
  uploadSingleFileApi,
  uploadMultipleFilesApi,
  downloadFileApi,
  deleteFileApi,
} from '../../../../lib/api/files';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';
import { ConfirmDialog } from '../../../../components/ui/ConfirmDialog';
import { JobModal } from '../../../../components/jobs/JobModal';
import { FileUploadZone } from '../../../../components/files/FileUploadZone';
import { FileList } from '../../../../components/files/FileList';
import { formatDate } from '../../../../lib/utils';
import { JOB_STATUSES } from '../../../../lib/constants';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import { ApiError } from '../../../../lib/api/client';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [files, setFiles] = useState<JobFile[]>([]);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingJob, setIsDeletingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const refreshFiles = useCallback(async () => {
    try {
      const data = await getJobFilesApi(jobId);
      setFiles(data);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setAuthError('You do not have permission to view or manage files for this job.');
      }
    }
  }, [jobId]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [jobData, fileData] = await Promise.all([
          getJobByIdApi(jobId),
          getJobFilesApi(jobId).catch((err) => {
            if (err instanceof ApiError && err.statusCode === 403) {
              setAuthError('You do not have permission to view or manage files for this job.');
            }
            return [];
          }),
        ]);

        if (!ignore) {
          setJob(jobData);
          setFiles(fileData);
          setJobError(null);
        }
      } catch (err) {
        if (!ignore) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setJobError('Job not found. It may have been deleted.');
          } else {
            const msg = err instanceof Error ? err.message : 'Failed to fetch job details.';
            setJobError(msg);
          }
        }
      } finally {
        if (!ignore) {
          setIsLoadingJob(false);
          setIsLoadingFiles(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [jobId]);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job || job.status === newStatus) return;
    setIsUpdatingStatus(true);
    setAuthError(null);

    try {
      const updated = await updateJobStatusApi(jobId, newStatus);
      setJob(updated);
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setAuthError('Permission Denied: Only the owner or an admin can update this job.');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to update status.';
        showToast(msg, 'error');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditJob = async (data: UpdateJobInput) => {
    setAuthError(null);
    try {
      const updated = await updateJobApi(jobId, data);
      setJob(updated);
      showToast('Job details updated successfully', 'success');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setAuthError('Permission Denied: Only the owner or an admin can edit this job.');
      }
      throw err;
    }
  };

  const handleDeleteJob = async () => {
    setIsDeletingJob(true);
    setAuthError(null);
    try {
      await deleteJobApi(jobId);
      showToast('Job deleted successfully', 'success');
      router.push('/jobs');
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setAuthError('Permission Denied: Only the owner or an admin can delete this job.');
        setIsDeleteModalOpen(false);
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to delete job.';
        showToast(msg, 'error');
      }
    } finally {
      setIsDeletingJob(false);
    }
  };

  const handleDownloadFile = async (file: JobFile) => {
    try {
      await downloadFileApi(jobId, file.id, file.originalName);
      showToast(`Downloaded "${file.originalName}"`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to download file.';
      showToast(msg, 'error');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileApi(jobId, fileId);
      showToast('File deleted successfully', 'success');
      refreshFiles();
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        showToast('Permission Denied: You cannot delete this file.', 'error');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to delete file.';
        showToast(msg, 'error');
      }
    }
  };

  if (isLoadingJob) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
        <Spinner size={24} />
        <p style={{ marginTop: '0.5rem' }}>Loading job details...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #cccccc',
              backgroundColor: '#f8f9fa',
              color: '#333333',
              textDecoration: 'none',
            }}
          >
            &larr; Back to Jobs
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            textAlign: 'center',
            padding: '2rem',
            marginBottom: '14px',
          }}
        >
          <h2 style={{ color: '#d9534f', marginBottom: '0.5rem' }}>Job Not Found</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {jobError || 'The requested job does not exist.'}
          </p>
          <Link
            href="/jobs"
            style={{
              display: 'inline-block',
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '4px',
              border: '1px solid #0052a3',
              backgroundColor: '#0066cc',
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === job.userId;
  const isAdmin = user?.role === 'ADMIN';
  const canModify = isOwner || isAdmin;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          href="/jobs"
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #cccccc',
            backgroundColor: '#f8f9fa',
            color: '#333333',
            textDecoration: 'none',
          }}
        >
          &larr; Back to Jobs
        </Link>
      </div>

      {authError && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '1rem',
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
          role="alert"
        >
          {authError}
        </div>
      )}

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #cccccc',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.4rem', margin: 0 }}>{job.title}</h1>
              <Badge status={job.status} />
            </div>
            <p style={{ fontSize: '0.8rem', color: '#777' }}>
              Created: {formatDate(job.createdAt)} | Updated: {formatDate(job.updatedAt)} | Owner: {job.userId.slice(0, 8)}... {isOwner && '(You)'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              disabled={!canModify}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={!canModify}
            >
              Delete
            </Button>
          </div>
        </div>

        <div style={{ padding: '0.75rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', margin: '0.75rem 0' }}>
          <p style={{ color: '#444', whiteSpace: 'pre-wrap' }}>
            {job.description || <span style={{ color: '#888', fontStyle: 'italic' }}>No description provided.</span>}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Update Status:</span>
          {JOB_STATUSES.map((s) => {
            const isCurrent = job.status === s.value;
            return (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                disabled={isCurrent || isUpdatingStatus || !canModify}
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  borderRadius: '4px',
                  border: isCurrent ? '1px solid #0052a3' : '1px solid #cccccc',
                  backgroundColor: isCurrent ? '#0066cc' : '#f8f9fa',
                  color: isCurrent ? '#ffffff' : '#333333',
                  cursor: isCurrent || isUpdatingStatus || !canModify ? 'not-allowed' : 'pointer',
                  opacity: isCurrent || isUpdatingStatus || !canModify ? 0.6 : 1,
                }}
              >
                {s.label}
              </button>
            );
          })}
          {isUpdatingStatus && <span style={{ fontSize: '0.8rem', color: '#666' }}>Updating...</span>}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>Attached Files ({files.length})</h2>

        <FileUploadZone
          jobId={jobId}
          onUploadSuccess={refreshFiles}
          onUploadSingle={(file) => uploadSingleFileApi(jobId, file)}
          onUploadBatch={(fls) => uploadMultipleFilesApi(jobId, fls)}
        />

        <FileList
          files={files}
          onDownload={handleDownloadFile}
          onDelete={handleDeleteFile}
          isLoading={isLoadingFiles}
        />
      </div>

      <JobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditJob}
        initialJob={job}
        mode="edit"
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        message={`Are you sure you want to delete "${job.title}" and its ${files.length} attached files?`}
        confirmText="Delete"
        isLoading={isDeletingJob}
        isDangerous
      />
    </div>
  );
}
