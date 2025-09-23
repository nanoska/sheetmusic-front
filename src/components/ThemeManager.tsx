import React, { useState } from 'react';
import { Theme } from '../types/api';
import ThemeTable from './ThemeTable';
import ThemeDetail from './ThemeDetail';

const ThemeManager: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
  };

  const handleBack = () => {
    setSelectedTheme(null);
  };

  if (selectedTheme) {
    return (
      <ThemeDetail
        theme={selectedTheme}
        onBack={handleBack}
      />
    );
  }

  return (
    <ThemeTable onThemeSelect={handleThemeSelect} />
  );
};

export default ThemeManager;