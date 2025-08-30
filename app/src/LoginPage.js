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

export default function LoginPage() {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isVerySmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // Function to calculate building height based on screen size
    const getBuildingHeight = (baseHeight) => {
        if (isVerySmallScreen) return baseHeight * 0.5; // 50% height on very small screens
        if (isSmallScreen) return baseHeight * 0.7;     // 70% height on small screens
        return baseHeight;                              // Full height on larger screens
    };

    const handleGoHome = () => {
        window.location.href = '/';
    }

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
            {/* Main content */}
            <Box
                component="form"
                noValidate
                autoComplete="off"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    position: 'relative',
                }}
            >
                {/* Login box in the center */}
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

                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        sx={{
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#e4ebf6',
                                '& fieldset': {
                                    border: 'none',
                                },
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="Password"
                        variant="outlined"
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#e4ebf6',
                                '& fieldset': {
                                    border: 'none',
                                },
                            },
                        }}
                    />

                    <Button
                        onClick={handleGoHome}
                        variant="contained"
                        sx={{
                            background: '#1d3e7d',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '20px',
                            '&:hover': {
                                backgroundColor: '#15305e',
                            }
                        }}
                    >
                        Login
                    </Button>
                </Paper>
            </Box>

            {/* Footer buildings - responsive */}
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
                {/* Building 1 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(250),
                        width: '6%',
                        minWidth: isVerySmallScreen ? '20px' : '40px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 2 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(140),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 3 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(230),
                        width: '7%',
                        minWidth: isVerySmallScreen ? '25px' : '45px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 4 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(140),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 5 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(160),
                        width: '6%',
                        minWidth: isVerySmallScreen ? '20px' : '40px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 6 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(120),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 7 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(230),
                        width: '7%',
                        minWidth: isVerySmallScreen ? '25px' : '45px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 8 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(160),
                        width: '6%',
                        minWidth: isVerySmallScreen ? '20px' : '40px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 9 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(250),
                        width: '8%',
                        minWidth: isVerySmallScreen ? '30px' : '50px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 10 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(250),
                        width: '8%',
                        minWidth: isVerySmallScreen ? '30px' : '50px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 11 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(140),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 12 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(230),
                        width: '7%',
                        minWidth: isVerySmallScreen ? '25px' : '45px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 13 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(140),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 14 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(160),
                        width: '6%',
                        minWidth: isVerySmallScreen ? '20px' : '40px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 15 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(120),
                        width: '5%',
                        minWidth: isVerySmallScreen ? '18px' : '35px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Transparent spacer */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(180),
                        width: '2%',
                        minWidth: isVerySmallScreen ? '5px' : '10px',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                    }}
                />

                {/* Building 16 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(230),
                        width: '7%',
                        minWidth: isVerySmallScreen ? '25px' : '45px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 17 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(160),
                        width: '6%',
                        minWidth: isVerySmallScreen ? '20px' : '40px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />

                {/* Building 18 */}
                <Paper
                    elevation={0}
                    sx={{
                        height: getBuildingHeight(250),
                        width: '8%',
                        minWidth: isVerySmallScreen ? '30px' : '50px',
                        backgroundColor: '#9AB4DD',
                        borderRadius: 0,
                    }}
                />
            </Box>
        </Box>
    );
}