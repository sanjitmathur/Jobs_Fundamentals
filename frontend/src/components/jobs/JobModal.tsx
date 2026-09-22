'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CreateJobInput, Job, JobStatus } from '../../types/job';
import { ApiError } from '../../lib/api/client';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  initialJob?: Job | null;
  mode?: 'create' | 'edit';
}

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

function JobFormContent({
  initialJob,
  mode,
  onClose,
  onSubmit,
}: {
  initialJob?: Job | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSubmit: (data: CreateJobInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialJob?.title || '');
  const [description, setDescription] = useState(initialJob?.description || '');
  const [status, setStatus] = useState<JobStatus>(initialJob?.status || 'PENDING');
  const [errors, setErrors] = useState<{ title?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Job title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          const titleErr = err.details.find((d) => d.field.includes('title'));
          if (titleErr) {
            setErrors({ title: titleErr.message });
            return;
          }
        }
        setErrors({ general: err.message });
      } else if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: 'Failed to save job. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#c9302c',
            fontSize: '0.875rem',
          }}
        >
          {errors.general}
        </div>
      )}

      <Input
        label="Job Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        autoFocus
      />

      <Textarea
        label="Description (Optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      {mode === 'create' && (
        <Select
          label="Initial Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
          options={STATUS_OPTIONS}
        />
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eeeeee',
        }}
      >
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create Job' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}

export function JobModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob,
  mode = 'create',
}: JobModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Job' : 'Edit Job Details'}
    >
      {isOpen && (
        <JobFormContent
          key={`${mode}-${initialJob?.id || 'new'}`}
          initialJob={initialJob}
          mode={mode}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}
