import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';  // ← Import App instead of LoginPage

// Create theme with Rubik font
const theme = createTheme({
    typography: {
        fontFamily: [
            'Rubik',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 700, // Make headings bold
        },
        button: {
            fontWeight: 500, // Medium weight for buttons
            textTransform: 'none', // Prevent uppercase transformation
        }
    },
    palette: {
        primary: {
            main: '#1d3e7d', // Your blue color from the login page
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        fontFamily: 'Rubik, sans-serif',
                    },
                },
            },
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App /> 
        </ThemeProvider>
    </React.StrictMode>
);

reportWebVitals();