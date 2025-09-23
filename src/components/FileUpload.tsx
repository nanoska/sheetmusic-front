import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../services/api';
import './FileUpload.css';

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadResults, setUploadResults] = useState<{[key: string]: 'success' | 'error'}>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        id: Math.random().toString(36).substr(2, 9)
      });
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/octet-stream': ['.mscz', '.mscx'],
      'text/*': ['.txt', '.xml']
    }
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return newFiles;
    });

    // Clean up progress and results
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
    setUploadResults(prev => {
      const newResults = { ...prev };
      delete newResults[fileId];
      return newResults;
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.name.endsWith('.mscz') || file.name.endsWith('.mscx')) return '🎼';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: Math.min((prev[file.id] || 0) + Math.random() * 30, 90)
          }));
        }, 200);

        // Here you would determine the appropriate endpoint based on file type
        let endpoint = '/upload/general/';
        if (file.type.startsWith('audio/')) {
          endpoint = '/upload/audio/';
        } else if (file.type.startsWith('image/')) {
          endpoint = '/upload/image/';
        } else if (file.type === 'application/pdf') {
          endpoint = '/upload/sheet-music/';
        }

        await apiService.uploadFile(file, endpoint);

        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
        setUploadResults(prev => ({ ...prev, [file.id]: 'success' }));

      } catch (error) {
        console.error('Upload error:', error);
        setUploadResults(prev => ({ ...prev, [file.id]: 'error' }));
      }
    }

    setUploading(false);
  };

  const clearAll = () => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadProgress({});
    setUploadResults({});
  };

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <h2>Subir Archivos</h2>
        <p>Arrastra y suelta archivos aquí o haz clic para seleccionar</p>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          {isDragActive ? (
            <p>Suelta los archivos aquí...</p>
          ) : (
            <>
              <p>Arrastra archivos aquí o <span className="click-text">haz clic para seleccionar</span></p>
              <p className="supported-formats">
                Formatos soportados: Audio (MP3, WAV, OGG), Imágenes (JPG, PNG), PDF, MuseScore (MSCZ, MSCX)
              </p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="files-section">
          <div className="files-header">
            <h3>Archivos Seleccionados ({files.length})</h3>
            <div className="action-buttons">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="upload-button"
              >
                {uploading ? 'Subiendo...' : 'Subir Archivos'}
              </button>
              <button
                onClick={clearAll}
                disabled={uploading}
                className="clear-button"
              >
                Limpiar Todo
              </button>
            </div>
          </div>

          <div className="files-list">
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <div className="file-preview">
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} />
                    ) : (
                      <span className="file-icon">{getFileIcon(file)}</span>
                    )}
                  </div>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.type || 'Tipo desconocido'}
                    </div>
                  </div>
                </div>

                <div className="file-actions">
                  {uploadProgress[file.id] !== undefined && (
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress[file.id]}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {Math.round(uploadProgress[file.id])}%
                      </span>
                    </div>
                  )}

                  {uploadResults[file.id] === 'success' && (
                    <span className="upload-status success">✅ Subido</span>
                  )}

                  {uploadResults[file.id] === 'error' && (
                    <span className="upload-status error">❌ Error</span>
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="remove-button"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;