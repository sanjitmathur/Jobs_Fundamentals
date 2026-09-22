'use client';

import React, { useState } from 'react';
import { JobFile } from '../../types/file';
import { formatBytes, formatDate } from '../../lib/utils';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';

interface FileListProps {
  files: JobFile[];
  onDownload: (file: JobFile) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
  isLoading?: boolean;
}

export function FileList({ files, onDownload, onDelete, isLoading }: FileListProps) {
  const [fileToDelete, setFileToDelete] = useState<JobFile | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async (file: JobFile) => {
    setDownloadingId(file.id);
    try {
      await onDownload(file);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(fileToDelete.id);
      setFileToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        <Spinner size={20} />
        <span style={{ marginLeft: '8px' }}>Loading files...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: '#ffffff',
          border: '1px solid #cccccc',
          borderRadius: '4px',
          color: '#666',
        }}
      >
        No files attached to this job yet.
      </div>
    );
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 10px',
    textAlign: 'left',
    border: '1px solid #dddddd',
    fontSize: '13px',
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    color: '#333333',
  };

  const tdStyle: React.CSSProperties = {
    padding: '8px 10px',
    textAlign: 'left',
    border: '1px solid #dddddd',
    fontSize: '13px',
  };

  return (
    <div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#ffffff',
          border: '1px solid #cccccc',
          marginTop: '10px',
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>File Name</th>
            <th style={thStyle}>Size</th>
            <th style={thStyle}>Uploaded</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isCurrentlyDownloading = downloadingId === file.id;
            return (
              <tr key={file.id}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{file.originalName}</td>
                <td style={{ ...tdStyle, color: '#666' }}>{formatBytes(file.size)}</td>
                <td style={{ ...tdStyle, color: '#666' }}>{formatDate(file.createdAt)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    disabled={isCurrentlyDownloading}
                    style={{ marginRight: '6px' }}
                  >
                    {isCurrentlyDownloading ? 'Downloading...' : 'Download'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setFileToDelete(file)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.originalName}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
        isDangerous
      />
    </div>
  );
}
