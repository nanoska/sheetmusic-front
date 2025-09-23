import React, { useState, useEffect } from 'react';
import { Theme } from '../types/api';
import { apiService } from '../services/api';
import './ThemeList.css';

const ThemeList: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadThemes();
  }, []);

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

  if (loading) {
    return (
      <div className="theme-list-container">
        <div className="loading">Cargando temas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-list-container">
        <div className="error-message">{error}</div>
        <button onClick={loadThemes} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="theme-list-container">
      <div className="theme-list-header">
        <h2>Temas Musicales</h2>
        <button className="add-button">
          + Agregar Tema
        </button>
      </div>

      {themes.length === 0 ? (
        <div className="empty-state">
          <p>No hay temas registrados aún.</p>
          <button className="add-button">
            Agregar primer tema
          </button>
        </div>
      ) : (
        <div className="themes-grid">
          {themes.map((theme) => (
            <div key={theme.id} className="theme-card">
              <div className="theme-image">
                {theme.image ? (
                  <img src={theme.image} alt={theme.title} />
                ) : (
                  <div className="placeholder-image">🎵</div>
                )}
              </div>

              <div className="theme-content">
                <h3 className="theme-title">{theme.title}</h3>
                {theme.artist && (
                  <p className="theme-artist">{theme.artist}</p>
                )}

                <div className="theme-meta">
                  {theme.tonalidad && (
                    <span className="tonality">Tonalidad: {theme.tonalidad}</span>
                  )}
                  <span className="versions-count">
                    {theme.versions?.length || 0} versiones
                  </span>
                </div>

                {theme.description && (
                  <p className="theme-description">{theme.description}</p>
                )}

                <div className="theme-actions">
                  <button className="action-button edit">Editar</button>
                  <button className="action-button view">Ver</button>
                  <button className="action-button delete">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeList;