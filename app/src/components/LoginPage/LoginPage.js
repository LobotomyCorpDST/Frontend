import * as React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useMediaQuery,
  Stack
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import http, { API_BASE } from '../../api/http';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const getBuildingHeight = (baseHeight) => {
    if (isVerySmallScreen) return baseHeight * 0.5;
    if (isSmallScreen) return baseHeight * 0.7;
    return baseHeight;
  };

  // --- MAIN LOGIN ---
  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setError('');

    const u = username.trim();
    const p = password;
    if (!u || !p) return;

    // Prevent guest login via main login button
    if (u.toLowerCase() === 'guest') {
      setError('Please use the "Guest Login" button for guest access');
      return;
    }

    setLoading(true);
    try {
      // Clear any stale auth data before setting new credentials
      ['token', 'access_token', 'jwt', 'role', 'room_id'].forEach((k) => localStorage.removeItem(k));

      const res = await http.post('/api/auth/login', { username: u, password: p });
      const data = res?.data ?? res;
      if (data?.token) {
        localStorage.setItem('token', data.token);

        // Get role from response (backend should return it)
        const userRole = data.role || 'STAFF'; // Default to STAFF if not provided
        localStorage.setItem('role', userRole.toLowerCase());

        // Store room_id if provided (for USER role)
        if (data.roomId) {
          localStorage.setItem('room_id', data.roomId);
        }

        // Route based on actual role
        if (userRole.toUpperCase() === 'GUEST') {
          navigate('/home-guest');
        } else if (userRole.toUpperCase() === 'USER') {
          navigate('/home-user');
        } else {
          // ADMIN or STAFF
          navigate('/home');
        }
      } else {
        throw new Error('Login response has no token');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // --- GUEST LOGIN ---
  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Clear any stale auth data before setting new credentials
      ['token', 'access_token', 'jwt', 'role', 'room_id'].forEach((k) => localStorage.removeItem(k));

      // ✅ Calls backend with predefined guest credentials
      const res = await http.post('/api/auth/login', {
        username: 'guest',
        password: 'guest123',
      });

      const data = res?.data ?? res;
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'guest');
        navigate('/home-guest');
      } else {
        throw new Error('Guest login failed: no token returned');
      }
    } catch (err) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const buildingConfig = [
    { height: 250, width: '6%', minWidth: '40px' },
    { height: 180, width: '2%', minWidth: '10px', transparent: true },
    { height: 140, width: '5%', minWidth: '35px' },
    { height: 230, width: '7%', minWidth: '45px' },
    { height: 180, width: '2%', minWidth: '10px', transparent: true },
    { height: 140, width: '5%', minWidth: '35px' },
    { height: 160, width: '6%', minWidth: '40px' },
    { height: 120, width: '5%', minWidth: '35px' },
    { height: 230, width: '7%', minWidth: '45px' },
    { height: 250, width: '8%', minWidth: '50px' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: '#b9cae6',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {/* Main Form */}
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleLogin}
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          position: 'relative',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            minWidth: 300,
            maxWidth: 400,
            width: isVerySmallScreen ? '90%' : 'auto',
            border: "1px solid #1d3e7d",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#1d3e7d',
              mb: 3,
              fontWeight: 700,
              fontFamily: 'inherit',
              fontSize: isVerySmallScreen ? '1.75rem' : '2.125rem'
            }}
          >
            Doomed Apt.
          </Typography>

          {/* Inputs */}
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#e4ebf6',
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#e4ebf6',
                '& fieldset': { border: 'none' },
              },
            }}
          />

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          {/* Buttons Section */}
          <Stack spacing={2} alignItems="center">
            {/* Main Login */}
            <Button
              type="submit"
              disabled={loading || !username.trim() || !password}
              variant="contained"
              sx={{
                background: '#1d3e7d',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '20px',
                width: '80%',
                '&:hover': { backgroundColor: '#15305e' },
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Guest Login */}
            <Button
              type="button"
              onClick={handleGuestLogin}
              disabled={loading}
              variant="contained"
              sx={{
                background: '#2AB7A9',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '20px',
                width: '80%',
                '&:hover': { backgroundColor: '#24a195ff' },
              }}
            >
              {loading ? 'Logging in...' : 'Guest Login'}
            </Button>
          </Stack>

          {/* API Info */}
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#1d3e7da8' }}>
            API: {API_BASE}
          </Typography>
        </Paper>
      </Box>

      {/* Footer Buildings */}
      <Box
        component="footer"
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          px: 0,
          backgroundColor: 'transparent',
          zIndex: 1,
        }}
      >
        {buildingConfig.map((b, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              height: getBuildingHeight(b.height),
              width: b.width,
              minWidth: isVerySmallScreen
                ? b.minWidth.replace(/\d+/g, m => Math.floor(parseInt(m) * 0.5))
                : b.minWidth,
              backgroundColor: b.transparent ? 'transparent' : '#9AB4DD',
              borderRadius: 0,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
