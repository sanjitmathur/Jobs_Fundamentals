'use client';

import React, { useState, useEffect } from 'react';
import { Job, CreateJobInput } from '../../../types/job';
import { PaginationMeta } from '../../../types/api';
import { getJobsApi, createJobApi } from '../../../lib/api/jobs';
import { JobCard } from '../../../components/jobs/JobCard';
import { JobFilterBar } from '../../../components/jobs/JobFilterBar';
import { JobModal } from '../../../components/jobs/JobModal';
import { Pagination } from '../../../components/jobs/Pagination';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      try {
        const res = await getJobsApi({
          page: meta.page,
          limit: meta.limit,
          status: statusFilter,
        });
        if (!ignore) {
          setJobs(res.data || []);
          setMeta(
            res.meta || {
              page: meta.page,
              limit: meta.limit,
              total: res.data?.length || 0,
              totalPages: 1,
            }
          );
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load jobs. Please check backend connection.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, [meta.page, meta.limit, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getJobsApi({
        page: meta.page,
        limit: meta.limit,
        status: statusFilter,
      });
      setJobs(res.data || []);
      setMeta(
        res.meta || {
          page: meta.page,
          limit: meta.limit,
          total: res.data?.length || 0,
          totalPages: 1,
        }
      );
      setError(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to refresh', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setIsLoading(true);
    setStatusFilter(status);
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleLimitChange = (limit: number) => {
    setMeta((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateJob = async (data: CreateJobInput) => {
    const newJob = await createJobApi(data);
    showToast(`Job "${newJob.title}" created successfully!`, 'success');
    handleRefresh();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.2rem', fontSize: '22px', color: '#222222' }}>Jobs</h1>
          <p style={{ color: '#666666', fontSize: '0.9rem' }}>
            List of all jobs and tasks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + New Job
          </Button>
        </div>
      </div>

      <JobFilterBar
        currentStatus={statusFilter}
        onStatusChange={handleStatusChange}
        limit={meta.limit}
        onLimitChange={handleLimitChange}
        totalJobs={meta.total}
      />

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '10px 14px',
            marginBottom: '1rem',
            borderRadius: '4px',
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            fontSize: '13px',
          }}
          role="alert"
        >
          <span>{error}</span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              handleRefresh();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          Loading jobs...
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            color: '#555',
          }}
        >
          <h3 style={{ marginBottom: '0.4rem', color: '#222222' }}>No jobs found</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#777' }}>
            {statusFilter !== 'ALL'
              ? `No jobs with status "${statusFilter}".`
              : 'There are no jobs yet.'}
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            + Create New Job
          </Button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '12px',
            }}
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <Pagination meta={meta} onPageChange={handlePageChange} />
        </>
      )}

      <JobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateJob}
        mode="create"
      />
    </div>
  );
}
