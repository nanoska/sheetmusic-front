import React, { useState, useEffect } from 'react';
import { Version, Theme } from '../types/api';
import { apiService } from '../services/api';
import VersionModal from './VersionModal';
import ConfirmDialog from './ConfirmDialog';
import './VersionList.css';

const VersionList: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modal states
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [versionsData, themesData] = await Promise.all([
        apiService.getVersions(),
        apiService.getThemes()
      ]);
      setVersions(versionsData);
      setThemes(themesData);
    } catch (err: any) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'Standard';
      case 'ENSAMBLE': return 'Ensamble';
      case 'DUETO': return 'Dueto';
      case 'GRUPO_REDUCIDO': return 'Grupo Reducido';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return '#28a745';
      case 'ENSAMBLE': return '#007bff';
      case 'DUETO': return '#fd7e14';
      case 'GRUPO_REDUCIDO': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  // CRUD Operations
  const handleCreateVersion = () => {
    setEditingVersion(null);
    setShowVersionModal(true);
  };

  const handleEditVersion = (version: Version) => {
    setEditingVersion(version);
    setShowVersionModal(true);
  };

  const handleDeleteVersion = (version: Version) => {
    setVersionToDelete(version);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!versionToDelete) return;

    try {
      await apiService.deleteVersion(versionToDelete.id);
      setVersions(prev => prev.filter(v => v.id !== versionToDelete.id));
      setShowDeleteConfirm(false);
      setVersionToDelete(null);
    } catch (err: any) {
      setError('Error al eliminar la versión');
      console.error('Error deleting version:', err);
    }
  };

  const handleModalSuccess = () => {
    loadData(); // Reload data after successful create/update
  };

  const handleDuplicateVersion = async (version: Version) => {
    try {
      // Create FormData with version data for duplication
      const formData = new FormData();
      formData.append('theme', version.theme.toString());
      formData.append('title', `${version.title || `Versión ${version.id}`} (Copia)`);
      formData.append('type', version.type);
      formData.append('notes', version.notes || '');

      await apiService.createVersion(formData);
      loadData(); // Reload data after duplication
    } catch (err: any) {
      setError('Error al duplicar la versión');
      console.error('Error duplicating version:', err);
    }
  };

  const filteredVersions = selectedType === 'all'
    ? versions
    : versions.filter(version => version.type === selectedType);

  const versionTypes = ['all', 'STANDARD', 'ENSAMBLE', 'DUETO', 'GRUPO_REDUCIDO'];

  if (loading) {
    return (
      <div className="versions-container">
        <div className="loading">Cargando versiones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="versions-container">
        <div className="error-message">{error}</div>
        <button onClick={loadData} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="versions-container">
      <div className="versions-header">
        <div className="header-content">
          <h2>Gestión de Versiones</h2>
          <p>Administra las diferentes versiones y arreglos de los temas musicales</p>
        </div>
        <button
          className="add-version-button"
          title="Crear nueva versión"
          onClick={handleCreateVersion}
        >
          ➕ Nueva Versión
        </button>
      </div>

      <div className="versions-filters">
        <div className="filter-tabs">
          {versionTypes.map((type) => (
            <button
              key={type}
              className={`filter-tab ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type === 'all' ? (
                <>
                  <span className="tab-icon">🎯</span>
                  Todas ({versions.length})
                </>
              ) : (
                <>
                  <span className="tab-icon">{getTypeIcon(type)}</span>
                  {getTypeLabel(type)} ({versions.filter(v => v.type === type).length})
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredVersions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎼</div>
          <h3>No hay versiones</h3>
          <p>
            {selectedType === 'all'
              ? 'No hay versiones registradas aún.'
              : `No hay versiones de tipo ${getTypeLabel(selectedType)}.`
            }
          </p>
          <button
            className="add-version-button"
            title="Crear primera versión"
            onClick={handleCreateVersion}
          >
            ➕ Crear primera versión
          </button>
        </div>
      ) : (
        <div className="versions-list">
          {filteredVersions.map((version) => (
            <div key={version.id} className="version-card">
              <div className="version-main">
                <div className="version-info">
                  <div className="version-title-section">
                    <h3 className="version-title">
                      {version.title || `Versión ${version.id}`}
                    </h3>
                    <div className="version-badges">
                      <span
                        className="type-badge"
                        style={{ backgroundColor: getTypeColor(version.type) }}
                      >
                        {getTypeIcon(version.type)} {getTypeLabel(version.type)}
                      </span>
                      <span className="sheets-badge">
                        📄 {version.sheet_music_count || 0} partituras
                      </span>
                    </div>
                  </div>

                  {version.notes && (
                    <p className="version-notes">{version.notes}</p>
                  )}

                  <div className="version-meta">
                    <span className="meta-item">
                      📅 Creado: {new Date(version.created_at).toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      🔄 Actualizado: {new Date(version.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="version-files">
                  {version.image && (
                    <div className="file-preview image-preview">
                      <img src={version.image} alt="Versión" />
                    </div>
                  )}

                  <div className="file-actions">
                    {version.audio_file && (
                      <button className="file-button audio">
                        🎵 Audio
                      </button>
                    )}
                    {version.mus_file && (
                      <button className="file-button musescore">
                        🎼 MuseScore
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="version-actions">
                <button
                  className="action-button edit"
                  title="Editar versión"
                  onClick={() => handleEditVersion(version)}
                >
                  ✏️
                </button>
                <button className="action-button view" title="Ver partituras">
                  👁️
                </button>
                <button
                  className="action-button duplicate"
                  title="Duplicar versión"
                  onClick={() => handleDuplicateVersion(version)}
                >
                  📋
                </button>
                <button
                  className="action-button delete"
                  title="Eliminar versión"
                  onClick={() => handleDeleteVersion(version)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version Modal */}
      <VersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        onSuccess={handleModalSuccess}
        version={editingVersion}
        themes={themes}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Eliminar Versión"
        message={`¿Estás seguro de que deseas eliminar la versión "${versionToDelete?.title || `Versión ${versionToDelete?.id}`}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive={true}
      />
    </div>
  );
};

export default VersionList;