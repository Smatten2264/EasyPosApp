// Importér nødvendige komponenter og hooks fra MUI + React


/**
 * Login.tsx
 * - Visuel centreret login-komponent med responsivt layout (mobil & desktop)
 * - Indeholder loginformular med API-kald, token-lagring og routing
 * - Brug af MUI (Material UI) for styling og tema
 * - Justeringer: 100dvh + 100vw + boxSizing + flexbox centreret layout
 */




import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  //STATE: Formularfelter og login-status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  //Theme og responsivt breakpoint tjek (mobile vs desktop)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  //Login logik – kald API og håndter svar
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Forhindre reload
    setLoginError(false); // Nulstil fejlbesked

    //Basic Auth format (brugernavn:kodeord → base64)
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    try {
      //Kald backend-login endpoint
      const response = await axios.post('/api/auth/login', {}, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });

      //Gem JWT-token – afhængigt af "Husk mig"
      const token = response.data.token;
      rememberMe
        ? localStorage.setItem('auth_token', token)
        : sessionStorage.setItem('auth_token', token);

      setIsLoggingIn(true);

      //Navigér til overbliks-side efter kort delay
      setTimeout(() => navigate('/overblik'), 1500);
    } catch (err) {
      //Forkert login → vis fejl
      console.error('Login failed:', err);
      setLoginError(true);
    }
  };

  return (
    //ROOT BOX: Fuld viewport, centreret indhold, baggrund farve
    <Box
      sx={{
        width: '100vw', // Brug viewport width – bedre end '100%'
        height: '100dvh', // Dynamic viewport height – virker på mobil
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isMobile ? theme.palette.primary.main : '#f4f6f8',
        p: 2, // Padding rundt om
        boxSizing: 'border-box', // Vigtigt for padding ikke "skubber"
      }}
    >
      {/*LOGIN-KORTET */}
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: { xs: 360, sm: 420, md: 500 }, // Responsiv max bredde
          maxHeight: '90vh', // Undgå at det fylder hele skærmen på små skærme
          overflowY: 'auto', // Giv scroll hvis indholdet vokser for stort
          borderRadius: 4,
          p: { xs: 3, sm: 4, md: 5 }, // Padding indvendigt
          bgcolor: '#fff',
          textAlign: 'center',
        }}
      >
        {/*Logo */}
        <Box mb={2} display="flex" justifyContent="center">
          <img
            src="/EasyPOS LOGO_kvadrat_blue.png"
            alt="EasyPOS Logo"
            style={{ width: 64, height: 'auto' }}
          />
        </Box>

        {/*Overskrift */}
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Log ind
        </Typography>

        {/*Fejlbesked ved mislykket login */}
        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Forkert brugernavn eller kodeord! Prøv igen.
          </Alert>
        )}

        {/*Formular med inputfelter */}
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            label="Brugernavn"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Kodeord"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/*Husk mig checkbox */}
          <Box textAlign="left" mt={1} mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Husk mig"
            />
          </Box>

          {/*Login-knap med loader */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.3,
              fontSize: '1rem',
              borderRadius: 2,
              mb: 1,
            }}
          >
            {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'Log ind'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
