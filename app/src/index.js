import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoginPage from "./LoginPage";
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
            <LoginPage />
        </ThemeProvider>
    </React.StrictMode>
);

reportWebVitals();