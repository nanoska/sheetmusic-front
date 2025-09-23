import React, { useState, useEffect } from 'react';
import { Theme, Version } from '../types/api';
import { apiService } from '../services/api';
import './ThemeDetail.css';

interface ThemeDetailProps {
  theme: Theme;
  onBack: () => void;
}

const ThemeDetail: React.FC<ThemeDetailProps> = ({ theme, onBack }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Version>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadVersions();
  }, [theme.id]);

  useEffect(() => {
    filterAndSortVersions();
  }, [versions, searchTerm, selectedType, sortField, sortDirection]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      // Simular carga de versiones del tema específico
      const allVersions = await apiService.getVersions();
      const themeVersions = allVersions.filter(version => version.theme === theme.id);
      setVersions(themeVersions);
    } catch (err: any) {
      setError('Error al cargar las versiones');
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVersions = () => {
    let filtered = versions.filter(version => {
      const matchesSearch = version.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           version.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || version.type === selectedType;
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    setFilteredVersions(filtered);
  };

  const handleSort = (field: keyof Version) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Version) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↗️' : '↘️';
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

  const versionTypes = ['all', 'STANDARD', 'ENSAMBLE', 'DUETO', 'GRUPO_REDUCIDO'];

  if (loading) {
    return (
      <div className="theme-detail-container">
        <div className="loading">Cargando versiones...</div>
      </div>
    );
  }

  return (
    <div className="theme-detail-container">
      <div className="detail-header">
        <div className="header-navigation">
          <button className="back-button" onClick={onBack} title="Volver a temas">
            ← Volver
          </button>
          <div className="breadcrumb">
            <span className="breadcrumb-item">Temas</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{theme.title}</span>
          </div>
        </div>

        <div className="theme-info">
          <div className="theme-image">
            {theme.image ? (
              <img src={theme.image} alt={theme.title} />
            ) : (
              <div className="placeholder-image">🎵</div>
            )}
          </div>
          <div className="theme-details">
            <h1>{theme.title}</h1>
            {theme.artist && <p className="theme-artist">por {theme.artist}</p>}
            <div className="theme-meta">
              {theme.tonalidad && (
                <span className="tonality-badge">{theme.tonalidad}</span>
              )}
              <span className="versions-count">
                {filteredVersions.length} de {versions.length} versiones
              </span>
            </div>
            {theme.description && (
              <p className="theme-description">{theme.description}</p>
            )}
          </div>
          <div className="theme-actions">
            <button className="action-button edit" title="Editar tema">
              ✏️ Editar
            </button>
            <button className="action-button add" title="Nueva versión">
              ➕ Nueva Versión
            </button>
          </div>
        </div>
      </div>

      <div className="versions-section">
        <div className="section-controls">
          <div className="search-and-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar versiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

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
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadVersions} className="retry-button">
              🔄 Reintentar
            </button>
          </div>
        )}

        {filteredVersions.length === 0 ? (
          <div className="empty-state">
            {searchTerm || selectedType !== 'all' ? (
              <>
                <div className="empty-icon">🔍</div>
                <h3>Sin resultados</h3>
                <p>No se encontraron versiones que coincidan con los filtros</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="clear-filters-button"
                >
                  Limpiar filtros
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">🎼</div>
                <h3>Sin versiones</h3>
                <p>Este tema aún no tiene versiones. Crea la primera versión.</p>
                <button className="add-button" title="Crear primera versión">
                  ➕ Crear primera versión
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="versions-table-wrapper">
            <table className="versions-table">
              <thead>
                <tr>
                  <th className="col-image"></th>
                  <th
                    className="col-title sortable"
                    onClick={() => handleSort('title')}
                  >
                    Título {getSortIcon('title')}
                  </th>
                  <th className="col-type">Tipo</th>
                  <th className="col-sheets">Partituras</th>
                  <th className="col-files">Archivos</th>
                  <th
                    className="col-created sortable"
                    onClick={() => handleSort('created_at')}
                  >
                    Creado {getSortIcon('created_at')}
                  </th>
                  <th className="col-actions">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVersions.map((version) => (
                  <tr key={version.id} className="version-row">
                    <td className="col-image">
                      <div className="version-image">
                        {version.image ? (
                          <img src={version.image} alt={version.title || `Versión ${version.id}`} />
                        ) : (
                          <div className="placeholder-image">{getTypeIcon(version.type)}</div>
                        )}
                      </div>
                    </td>
                    <td className="col-title">
                      <div className="version-title">
                        {version.title || `Versión ${version.id}`}
                      </div>
                      {version.notes && (
                        <div className="version-notes">{version.notes}</div>
                      )}
                    </td>
                    <td className="col-type">
                      <span
                        className="type-badge"
                        style={{ backgroundColor: getTypeColor(version.type) }}
                      >
                        {getTypeIcon(version.type)} {getTypeLabel(version.type)}
                      </span>
                    </td>
                    <td className="col-sheets">
                      <span className="sheets-count">
                        {version.sheet_music?.length || 0}
                      </span>
                    </td>
                    <td className="col-files">
                      <div className="file-indicators">
                        {version.audio_file && (
                          <span className="file-indicator audio" title="Audio disponible">🎵</span>
                        )}
                        {version.mus_file && (
                          <span className="file-indicator musescore" title="MuseScore disponible">🎼</span>
                        )}
                      </div>
                    </td>
                    <td className="col-created">
                      {new Date(version.created_at).toLocaleDateString()}
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button className="action-button view" title="Ver partituras">
                          👁️
                        </button>
                        <button className="action-button edit" title="Editar versión">
                          ✏️
                        </button>
                        <button className="action-button duplicate" title="Duplicar versión">
                          📋
                        </button>
                        <button className="action-button delete" title="Eliminar versión">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeDetail;