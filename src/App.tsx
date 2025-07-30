import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Signout from './pages/Signout';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import Login from './pages/Login';

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const showSidebar = !isLoginPage;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {showSidebar && <Sidebar />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: showSidebar && !isMobile ? 3 : 0,
          mt: showSidebar && isMobile ? 7 : 0, // margin top for AppBar på mobil
          ml: showSidebar && !isMobile ? '220px' : 0, // margin left for fast sidebar
          backgroundColor: isLoginPage ? '#f9fafb' : 'inherit',
          width: '100%',
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/overblik" element={<Overview />} />
          <Route path="/indstilling" element={<Settings />} />
          <Route path="/logud" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
