import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import ThemeList from './ThemeList';
import './Dashboard.css';

type TabType = 'themes' | 'upload' | 'instruments' | 'versions';

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('themes');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'themes':
        return <ThemeList />;
      case 'upload':
        return <FileUpload />;
      case 'instruments':
        return <div className="tab-content">Gestión de Instrumentos (En desarrollo)</div>;
      case 'versions':
        return <div className="tab-content">Gestión de Versiones (En desarrollo)</div>;
      default:
        return <ThemeList />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Panel Administrativo - Sheet Music</h1>
          <div className="user-info">
            <span>Bienvenido, {user?.first_name || user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul className="nav-list">
            <li>
              <button
                className={`nav-button ${activeTab === 'themes' ? 'active' : ''}`}
                onClick={() => setActiveTab('themes')}
              >
                <span className="nav-icon">🎵</span>
                Temas Musicales
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <span className="nav-icon">📁</span>
                Subir Archivos
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${activeTab === 'instruments' ? 'active' : ''}`}
                onClick={() => setActiveTab('instruments')}
              >
                <span className="nav-icon">🎺</span>
                Instrumentos
              </button>
            </li>
            <li>
              <button
                className={`nav-button ${activeTab === 'versions' ? 'active' : ''}`}
                onClick={() => setActiveTab('versions')}
              >
                <span className="nav-icon">📋</span>
                Versiones
              </button>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;