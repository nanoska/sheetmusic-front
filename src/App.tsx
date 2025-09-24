import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Events from './pages/Events';
import Themes from './pages/Themes';
import Versions from './pages/Versions';
import Locations from './pages/Locations';
import Repertoires from './pages/Repertoires';
import Upload from './pages/Upload';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/themes"
              element={
                <ProtectedRoute>
                  <Themes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/versions"
              element={
                <ProtectedRoute>
                  <Versions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute>
                  <Locations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repertoires"
              element={
                <ProtectedRoute>
                  <Repertoires />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/themes" replace />} />
            <Route path="/dashboard" element={<Navigate to="/themes" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;