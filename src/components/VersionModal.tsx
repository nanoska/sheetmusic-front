import React, { useState, useEffect } from 'react';
import { Version, Theme } from '../types/api';
import { apiService } from '../services/api';
import './VersionModal.css';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  version?: Version | null;
  themes: Theme[];
}

interface VersionFormData {
  theme: number | '';
  title: string;
  type: 'STANDARD' | 'ENSAMBLE' | 'DUETO' | 'GRUPO_REDUCIDO';
  notes: string;
  image: File | null;
  audio_file: File | null;
  mus_file: File | null;
}

const VersionModal: React.FC<VersionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  version,
  themes
}) => {
  const [formData, setFormData] = useState<VersionFormData>({
    theme: '',
    title: '',
    type: 'STANDARD',
    notes: '',
    image: null,
    audio_file: null,
    mus_file: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!version;

  useEffect(() => {
    if (isOpen) {
      if (version) {
        setFormData({
          theme: version.theme,
          title: version.title || '',
          type: version.type,
          notes: version.notes || '',
          image: null,
          audio_file: null,
          mus_file: null
        });
      } else {
        setFormData({
          theme: '',
          title: '',
          type: 'STANDARD',
          notes: '',
          image: null,
          audio_file: null,
          mus_file: null
        });
      }
      setError('');
    }
  }, [isOpen, version]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.theme) {
      setError('Debes seleccionar un tema');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const submitData = new FormData();
      submitData.append('theme', formData.theme.toString());
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('notes', formData.notes);

      if (formData.image) {
        submitData.append('image', formData.image);
      }
      if (formData.audio_file) {
        submitData.append('audio_file', formData.audio_file);
      }
      if (formData.mus_file) {
        submitData.append('mus_file', formData.mus_file);
      }

      if (isEditing) {
        await apiService.updateVersion(version!.id, submitData);
      } else {
        await apiService.createVersion(submitData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la versión');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: 'image' | 'audio_file' | 'mus_file') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STANDARD': return '🎼';
      case 'ENSAMBLE': return '👥';
      case 'DUETO': return '👫';
      case 'GRUPO_REDUCIDO': return '🎭';
      default: return '🎵';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content version-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Editar Versión' : '➕ Nueva Versión'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="version-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="theme">Tema Musical *</label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: Number(e.target.value) || '' }))}
                required
                disabled={isEditing}
              >
                <option value="">Seleccionar tema...</option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.title} {theme.artist ? `- ${theme.artist}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo de Versión *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                required
              >
                <option value="STANDARD">{getTypeIcon('STANDARD')} Standard</option>
                <option value="ENSAMBLE">{getTypeIcon('ENSAMBLE')} Ensamble</option>
                <option value="DUETO">{getTypeIcon('DUETO')} Dueto</option>
                <option value="GRUPO_REDUCIDO">{getTypeIcon('GRUPO_REDUCIDO')} Grupo Reducido</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Título de la Versión</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Versión para banda de concierto, Arreglo simplificado..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notas y Observaciones</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describe las características de esta versión, instrumentación, nivel de dificultad, etc."
              rows={4}
            />
          </div>

          <div className="file-uploads">
            <h3>Archivos</h3>

            <div className="form-row">
              <div className="form-group file-group">
                <label htmlFor="image">🖼️ Imagen de la versión</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange('image')}
                />
                {version?.image && !formData.image && (
                  <div className="current-file">Archivo actual: {version.image.split('/').pop()}</div>
                )}
              </div>

              <div className="form-group file-group">
                <label htmlFor="audio_file">🎵 Archivo de Audio</label>
                <input
                  type="file"
                  id="audio_file"
                  accept="audio/*"
                  onChange={handleFileChange('audio_file')}
                />
                {version?.audio_file && !formData.audio_file && (
                  <div className="current-file">Archivo actual: {version.audio_file.split('/').pop()}</div>
                )}
              </div>
            </div>

            <div className="form-group file-group">
              <label htmlFor="mus_file">🎼 Archivo MuseScore (.mscz, .mscx)</label>
              <input
                type="file"
                id="mus_file"
                accept=".mscz,.mscx"
                onChange={handleFileChange('mus_file')}
              />
              {version?.mus_file && !formData.mus_file && (
                <div className="current-file">Archivo actual: {version.mus_file.split('/').pop()}</div>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VersionModal;