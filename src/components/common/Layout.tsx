import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Music,
  Calendar,
  MapPin,
  Users,
  Settings,
  LogOut,
  User,
  Moon,
  Sun,
  Upload,
  FileMusic,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const miniDrawerWidth = 56;

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

const navigationSections: NavigationSection[] = [
  {
    items: [
      {
        key: 'themes',
        label: 'Temas',
        icon: <Music size={20} />,
        path: '/themes',
      },
      {
        key: 'versions',
        label: 'Versiones',
        icon: <FileMusic size={20} />,
        path: '/versions',
      },
      {
        key: 'repertoires',
        label: 'Repertorios',
        icon: <Users size={20} />,
        path: '/repertoires',
      },
    ]
  },
  {
    items: [
      {
        key: 'events',
        label: 'Eventos',
        icon: <Calendar size={20} />,
        path: '/events',
      },
      {
        key: 'locations',
        label: 'Ubicaciones',
        icon: <MapPin size={20} />,
        path: '/locations',
      },
    ]
  },
  {
    items: [
      {
        key: 'upload',
        label: 'Subir Archivos',
        icon: <Upload size={20} />,
        path: '/upload',
      },
    ]
  },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'SheetMusic' }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    // Implementar logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawer = (isCollapsed: boolean) => (
    <div>
      <Toolbar>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div">
            SheetMusic
          </Typography>
        )}
        <Box flexGrow={1} />
        {!isCollapsed && (
          <IconButton onClick={handleDrawerCollapse}>
            <ChevronLeft />
          </IconButton>
        )}
        {isCollapsed && (
          <IconButton onClick={handleDrawerCollapse}>
            <ChevronRight />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {navigationSections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <List>
            {section.items.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  selected={location.pathname.startsWith(item.path)}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 'auto' : 3,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {sectionIndex < navigationSections.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : miniDrawerWidth}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : miniDrawerWidth}px` },
          transition: 'width 0.2s, margin 0.2s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>

          <IconButton
            size="large"
            aria-label="account menu"
            aria-controls="account-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <User size={16} />
            </Avatar>
          </IconButton>

          <Menu
            id="account-menu"
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => {
              handleUserMenuClose();
              navigate('/settings');
            }}>
              <ListItemIcon>
                <Settings size={16} />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              handleUserMenuClose();
              handleLogout();
            }}>
              <ListItemIcon>
                <LogOut size={16} />
              </ListItemIcon>
              Salir
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: drawerOpen ? drawerWidth : miniDrawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.2s',
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer(false)}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerOpen ? drawerWidth : miniDrawerWidth,
              transition: 'width 0.2s',
            },
          }}
          open
        >
          {drawer(!drawerOpen)}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : miniDrawerWidth}px)` },
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}