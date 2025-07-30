import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const links = [
    { text: 'Overblik', icon: <DashboardIcon />, to: '/overblik' },
    { text: 'Indstilling', icon: <SettingsIcon />, to: '/indstilling' },
    { text: 'Log ud', icon: <LogoutIcon />, to: '/logud' },
  ];

  const drawerContent = (
    <Box sx={{ backgroundColor: '#1e293b', height: '100%', color: '#fff', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#fff' }}>
        EasyPos
      </Typography>
      <List>
        {links.map((link) => (
          <ListItemButton
            key={link.text}
            component={NavLink}
            to={link.to}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              color: '#fff',
              '&.active': {
                color: '#60a5fa',
                fontWeight: 'bold',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Menu icon for mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2000 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Drawer for mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // Permanent sidebar for desktop
        <Box
          sx={{
            width: '220px',
            backgroundColor: '#1e293b',
            color: '#fff',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            p: 2,
          }}
        >
          {drawerContent}
        </Box>
      )}
    </>
  );
};

export default Sidebar;
