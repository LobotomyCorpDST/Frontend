import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// สร้าง Theme โดยใช้ฟอนต์ Bai Jamjuree
const theme = createTheme({
    typography: {
        fontFamily: [
            'Bai Jamjuree', // ← เปลี่ยนตรงนี้
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 700,
        },
        button: {
            fontWeight: 500,
            textTransform: 'none',
        }
    },
    palette: {
        primary: {
            main: '#1d3e7d', // สีน้ำเงินหลักของคุณ
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        fontFamily: 'Bai Jamjuree, sans-serif', // ← และเปลี่ยนตรงนี้ด้วย
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