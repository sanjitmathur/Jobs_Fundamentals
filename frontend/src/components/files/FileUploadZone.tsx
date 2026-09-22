'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '../../lib/constants';
import { formatBytes } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface FileUploadZoneProps {
  jobId: string;
  onUploadSuccess: () => void;
  onUploadSingle: (file: File) => Promise<unknown>;
  onUploadBatch: (files: File[]) => Promise<unknown>;
}

export function FileUploadZone({
  onUploadSuccess,
  onUploadSingle,
  onUploadBatch,
}: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `File "${file.name}" has an unsupported format (${ext}). Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File "${file.name}" exceeds the maximum 10MB size limit (${formatBytes(file.size)}).`;
    }
    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        newFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach((err) => showToast(err, 'error', 5000));
    }

    if (newFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    try {
      if (selectedFiles.length === 1) {
        await onUploadSingle(selectedFiles[0]);
        showToast(`Uploaded "${selectedFiles[0].name}" successfully`, 'success');
      } else {
        await onUploadBatch(selectedFiles);
        showToast(`Uploaded ${selectedFiles.length} files successfully`, 'success');
      }
      setSelectedFiles([]);
      onUploadSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cccccc',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '1.25rem',
      }}
    >
      <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Upload New File(s)</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragActive ? '#0066cc' : '#cccccc'}`,
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDragActive ? '#f0f7ff' : '#ffffff',
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          accept={ALLOWED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
        />
        <p style={{ fontWeight: 500, color: '#333', marginBottom: '0.25rem' }}>
          Drag and drop files here, or click to browse
        </p>
        <p style={{ fontSize: '0.8rem', color: '#777' }}>
          Allowed types: PDF, images, txt, csv, json, zip, doc, docx (max 10MB)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Selected Files ({selectedFiles.length}):
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.75rem' }}>
            {selectedFiles.map((file, idx) => (
              <li
                key={`${file.name}-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 8px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '3px',
                  marginBottom: '4px',
                  fontSize: '0.85rem',
                }}
              >
                <span>
                  {file.name} <span style={{ color: '#888' }}>({formatBytes(file.size)})</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeSelectedFile(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px 6px',
                    color: '#c9302c',
                    cursor: 'pointer',
                    fontSize: '12px',
                    borderRadius: '3px',
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleUpload}
            isLoading={isUploading}
          >
            Upload {selectedFiles.length === 1 ? 'File' : 'Files'}
          </Button>
        </div>
      )}
    </div>
  );
}
