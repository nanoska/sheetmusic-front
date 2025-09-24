import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Grid,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import {
  Upload as UploadIcon,
  File,
  Music,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import Layout from '../components/common/Layout';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  type: 'audio' | 'sheet_music' | 'image' | 'other';
}

const getFileType = (file: File): UploadFile['type'] => {
  const { type, name } = file;

  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf' || name.toLowerCase().includes('.pdf')) return 'sheet_music';
  if (name.toLowerCase().match(/\.(mscz|mscx|xml|musicxml)$/)) return 'sheet_music';

  return 'other';
};

const getFileIcon = (type: UploadFile['type']) => {
  switch (type) {
    case 'audio':
      return <Music size={20} />;
    case 'image':
      return <Image size={20} />;
    case 'sheet_music':
      return <File size={20} />;
    default:
      return <File size={20} />;
  }
};

const getFileTypeLabel = (type: UploadFile['type']) => {
  switch (type) {
    case 'audio':
      return 'Audio';
    case 'image':
      return 'Imagen';
    case 'sheet_music':
      return 'Partitura';
    default:
      return 'Archivo';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 15),
      status: 'pending',
      progress: 0,
      type: getFileType(file),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/xml': ['.xml', '.musicxml'],
      'application/octet-stream': ['.mscz', '.mscx'],
    },
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;

      try {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading' as const }
            : f
        ));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, progress }
              : f
          ));
        }

        // TODO: Implement actual upload to API
        // await apiService.uploadFile(uploadFile.file, uploadFile.type);

        // Mark as success
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        ));

      } catch (error) {
        // Mark as error
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error' as const,
                error: 'Error al subir el archivo'
              }
            : f
        ));
      }
    }

    setIsUploading(false);
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'success');
  const errorFiles = files.filter(f => f.status === 'error');

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'uploading':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'uploading':
        return <Cloud size={16} />;
      default:
        return null;
    }
  };

  return (
    <Layout title="Subir Archivos">
      <Box>
        <Box display="flex" justifyContent="center" mb={4}>
          <Box sx={{ maxWidth: '800px', width: '100%' }}>
            <Grid container spacing={3}>
              {/* Dropzone Area */}
              <Grid item xs={12} md={8}>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
              <input {...getInputProps()} />

              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <UploadIcon size={48} color={isDragActive ? 'primary' : 'action'} />

                <Typography variant="h6" color={isDragActive ? 'primary' : 'textPrimary'}>
                  {isDragActive
                    ? 'Suelta los archivos aquí'
                    : 'Arrastra archivos aquí o haz clic para seleccionar'
                  }
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Formatos soportados: MP3, WAV, PDF, MSCZ, XML, JPG, PNG
                </Typography>

                <Typography variant="caption" color="textSecondary">
                  Máximo 10MB por archivo
                </Typography>
              </Box>
            </Paper>

            {files.length > 0 && (
              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Archivos ({files.length})
                  </Typography>

                  <Box display="flex" gap={1}>
                    {completedFiles.length > 0 && (
                      <Button
                        size="small"
                        onClick={clearCompleted}
                      >
                        Limpiar Completados
                      </Button>
                    )}

                    <Button
                      size="small"
                      onClick={clearAll}
                      color="error"
                    >
                      Limpiar Todo
                    </Button>

                    {pendingFiles.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={uploadFiles}
                        disabled={isUploading}
                        startIcon={<UploadIcon size={16} />}
                      >
                        Subir Archivos
                      </Button>
                    )}
                  </Box>
                </Box>

                <List>
                  {files.map((uploadFile) => (
                    <ListItem
                      key={uploadFile.id}
                      divider
                      secondaryAction={
                        uploadFile.status === 'pending' && (
                          <IconButton
                            edge="end"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X size={16} />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(uploadFile.type)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {uploadFile.file.name}
                            </Typography>

                            <Chip
                              label={getFileTypeLabel(uploadFile.type)}
                              size="small"
                              variant="outlined"
                            />

                            <Chip
                              label={uploadFile.status}
                              size="small"
                              color={getStatusColor(uploadFile.status)}
                              icon={getStatusIcon(uploadFile.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {formatFileSize(uploadFile.file.size)}
                            </Typography>

                            {uploadFile.status === 'uploading' && (
                              <Box mt={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={uploadFile.progress}
                                />
                              </Box>
                            )}

                            {uploadFile.error && (
                              <Typography variant="caption" color="error">
                                {uploadFile.error}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>

              {/* Summary Panel */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Subida
                  </Typography>

                  {files.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No hay archivos seleccionados
                    </Typography>
                  ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Total de archivos: {files.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Tamaño total: {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}
                        </Typography>
                      </Box>

                      {pendingFiles.length > 0 && (
                        <Alert severity="info">
                          {pendingFiles.length} archivo(s) pendiente(s) de subir
                        </Alert>
                      )}

                      {completedFiles.length > 0 && (
                        <Alert severity="success">
                          {completedFiles.length} archivo(s) subido(s) correctamente
                        </Alert>
                      )}

                      {errorFiles.length > 0 && (
                        <Alert severity="error">
                          {errorFiles.length} archivo(s) con errores
                        </Alert>
                      )}

                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Tipos de archivo:
                        </Typography>
                        {['audio', 'image', 'sheet_music', 'other'].map(type => {
                          const count = files.filter(f => f.type === type).length;
                          return count > 0 ? (
                            <Box key={type} display="flex" justifyContent="space-between">
                              <Typography variant="caption">
                                {getFileTypeLabel(type as UploadFile['type'])}:
                              </Typography>
                              <Typography variant="caption">
                                {count}
                              </Typography>
                            </Box>
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}