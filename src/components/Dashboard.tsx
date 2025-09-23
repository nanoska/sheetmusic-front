import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import FileUpload from './FileUpload';
import ThemeManager from './ThemeManager';
import VersionList from './VersionList';
import ThemeToggle from './ThemeToggle';
import './Dashboard.css';

type TabType = 'themes' | 'upload' | 'versions';

const Dashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'themes':
        return <ThemeManager />;
      case 'upload':
        return <FileUpload />;
      case 'versions':
        return <VersionList />;
      default:
        return <ThemeManager />;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {sidebarCollapsed ? '☰' : '✕'}
            </button>
            <h1>Panel Administrativo - Sheet Music</h1>
          </div>
          <div className="user-info">
            <span>Bienvenido, {user?.first_name || user?.username}</span>
            <ThemeToggle />
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            <ul className="nav-list">
              <li>
                <button
                  className={`nav-button ${activeTab === 'themes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('themes')}
                >
                  <span className="nav-icon">🎵</span>
                  {!sidebarCollapsed && <span className="nav-text">Temas Musicales</span>}
                </button>
              </li>
              <li>
                <button
                  className={`nav-button ${activeTab === 'versions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('versions')}
                >
                  <span className="nav-icon">📋</span>
                  {!sidebarCollapsed && <span className="nav-text">Versiones</span>}
                </button>
              </li>
            </ul>
          </div>
          <div className="sidebar-bottom">
            <button
              className={`upload-button-fixed ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
              title="Subir Archivos"
            >
              <span className="upload-icon">📁</span>
            </button>
          </div>
        </nav>

        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;