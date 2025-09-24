import { createTheme } from '@mui/material/styles';

// Tema principal limpio y minimalista
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#e91e63',
      dark: '#ad0037',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h5: {
      fontWeight: 500,
      marginBottom: '0.75rem',
    },
    h6: {
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    // Configuración global para todos los componentes MUI
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Sin mayúsculas automáticas
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.04)', // Se adapta automáticamente al tema
        },
      },
    },
  },
});

// Tema oscuro
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#bbdefb',
      dark: '#5c6bc0',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: theme.typography,
  spacing: theme.spacing,
  shape: theme.shape,
  components: {
    ...theme.components,
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.08)', // Color más claro para dark mode
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)', // Shadow más fuerte en dark mode
        },
      },
    },
  },
});