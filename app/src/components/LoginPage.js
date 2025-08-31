import * as React from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    useMediaQuery
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import './LoginPage.css';

export default function LoginPage() {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isVerySmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleGoHome = () => {
        window.location.href = '/';
    }

    // Function to calculate building height based on screen size
    const getBuildingHeight = (baseHeight) => {
        if (isVerySmallScreen) return baseHeight * 0.5;
        if (isSmallScreen) return baseHeight * 0.7;
        return baseHeight;
    };

    // Data for the buildings and spacers
    const footerElements = [
        { type: 'building', baseHeight: 250, width: '6%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 140, width: '5%' },
        { type: 'building', baseHeight: 230, width: '7%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 140, width: '5%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 160, width: '6%' },
        { type: 'building', baseHeight: 120, width: '5%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 230, width: '7%' },
        { type: 'building', baseHeight: 160, width: '6%' },
        { type: 'building', baseHeight: 250, width: '8%' },
        { type: 'building', baseHeight: 250, width: '8%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 140, width: '5%' },
        { type: 'building', baseHeight: 230, width: '7%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 140, width: '5%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 160, width: '6%' },
        { type: 'building', baseHeight: 120, width: '5%' },
        { type: 'spacer', baseHeight: 180, width: '2%' },
        { type: 'building', baseHeight: 230, width: '7%' },
        { type: 'building', baseHeight: 160, width: '6%' },
        { type: 'building', baseHeight: 250, width: '8%' },
    ];

    return (
        <Box className="login-page-container">
            {/* Main content */}
            <Box
                component="form"
                noValidate
                autoComplete="off"
                className="login-form-container"
            >
                {/* Login box in the center */}
                <Paper
                    elevation={3}
                    className="login-paper"
                    sx={{ width: isVerySmallScreen ? '90%' : 'auto' }}
                >
                    <Typography
                        variant="h4"
                        className="login-title"
                        sx={{ fontSize: isVerySmallScreen ? '1.75rem' : '2.125rem' }}
                    >
                        Doomed Apt.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        className="login-textfield"
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="Password"
                        variant="outlined"
                        className="login-textfield"
                    />

                    <Button
                        onClick={handleGoHome}
                        variant="contained"
                        className="login-button"
                    >
                        Login
                    </Button>
                </Paper>
            </Box>

            {/* Footer buildings - responsive and generated from data */}
            <Box
                component="footer"
                className="login-page-footer"
            >
                {footerElements.map((element, index) => (
                    <Paper
                        key={index}
                        elevation={0}
                        className={element.type}
                        sx={{
                            height: getBuildingHeight(element.baseHeight),
                            width: element.width,
                            minWidth: isVerySmallScreen ? (element.type === 'building' ? '20px' : '5px') : (element.type === 'building' ? '40px' : '10px'),
                            backgroundColor: element.type === 'building' ? '#9AB4DD' : 'transparent',
                            borderRadius: 0,
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}
