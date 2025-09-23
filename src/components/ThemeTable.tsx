import React, { useState, useEffect } from 'react';
import { Theme } from '../types/api';
import { apiService } from '../services/api';
import './ThemeTable.css';

interface ThemeTableProps {
  onThemeSelect?: (theme: Theme) => void;
}

const ThemeTable: React.FC<ThemeTableProps> = ({ onThemeSelect }) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Theme>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    filterAndSortThemes();
  }, [themes, searchTerm, sortField, sortDirection]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getThemes();
      setThemes(data);
    } catch (err: any) {
      setError('Error al cargar los temas');
      console.error('Error loading themes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortThemes = () => {
    let filtered = themes.filter(theme =>
      theme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.artist && theme.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    setFilteredThemes(filtered);
  };

  const handleSort = (field: keyof Theme) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleThemeClick = (theme: Theme) => {
    if (onThemeSelect) {
      onThemeSelect(theme);
    }
  };

  const getSortIcon = (field: keyof Theme) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↗️' : '↘️';
  };

  if (loading) {
    return (
      <div className="theme-table-container">
        <div className="loading">Cargando temas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-table-container">
        <div className="error-message">{error}</div>
        <button onClick={loadThemes} className="retry-button">
          🔄 Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="theme-table-container">
      <div className="table-header">
        <div className="header-content">
          <h2>Temas Musicales</h2>
          <div className="table-stats">
            {filteredThemes.length} de {themes.length} temas
          </div>
        </div>
        <button className="add-button" title="Agregar nuevo tema">
          ➕ Nuevo Tema
        </button>
      </div>

      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por título o compositor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {filteredThemes.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <div className="empty-icon">🔍</div>
              <h3>Sin resultados</h3>
              <p>No se encontraron temas que coincidan con "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')} className="clear-search-button">
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <div className="empty-icon">🎵</div>
              <h3>No hay temas</h3>
              <p>Comienza agregando tu primer tema musical</p>
              <button className="add-button" title="Agregar primer tema">
                ➕ Agregar primer tema
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="themes-table">
            <thead>
              <tr>
                <th className="col-image"></th>
                <th
                  className="col-title sortable"
                  onClick={() => handleSort('title')}
                >
                  Título {getSortIcon('title')}
                </th>
                <th
                  className="col-artist sortable"
                  onClick={() => handleSort('artist')}
                >
                  Compositor {getSortIcon('artist')}
                </th>
                <th className="col-tonality">Tonalidad</th>
                <th className="col-versions">Versiones</th>
                <th className="col-created">Creado</th>
                <th className="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredThemes.map((theme) => (
                <tr
                  key={theme.id}
                  className="theme-row"
                  onClick={() => handleThemeClick(theme)}
                >
                  <td className="col-image">
                    <div className="theme-image">
                      {theme.image ? (
                        <img src={theme.image} alt={theme.title} />
                      ) : (
                        <div className="placeholder-image">🎵</div>
                      )}
                    </div>
                  </td>
                  <td className="col-title">
                    <div className="theme-title">{theme.title}</div>
                    {theme.description && (
                      <div className="theme-description">{theme.description}</div>
                    )}
                  </td>
                  <td className="col-artist">
                    {theme.artist || '-'}
                  </td>
                  <td className="col-tonality">
                    {theme.tonalidad && (
                      <span className="tonality-badge">{theme.tonalidad}</span>
                    )}
                  </td>
                  <td className="col-versions">
                    <span className="versions-count">
                      {theme.versions?.length || 0}
                    </span>
                  </td>
                  <td className="col-created">
                    {new Date(theme.created_at).toLocaleDateString()}
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button
                        className="action-button view"
                        title="Ver versiones"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeClick(theme);
                        }}
                      >
                        👁️
                      </button>
                      <button
                        className="action-button edit"
                        title="Editar tema"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-button delete"
                        title="Eliminar tema"
                        onClick={(e) => e.stopPropagation()}
                      >
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
  );
};

export default ThemeTable;