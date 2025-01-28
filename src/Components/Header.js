import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Modal, Box, TextField, Divider, IconButton, Menu, MenuItem, createTheme, ThemeProvider } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doSignOut, doCreateUserWithEmailAndPassword } from './firebase/auth';
import { useAuth } from '../contexts/authContext';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const Header = () => {
    const { userLoggedIn, currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleAuthModal = () => setShowModal(true);
    const handleRegisterModal = () => {
        setShowModal(false);
        setShowRegisterModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setShowRegisterModal(false);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const theme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#6daffe',
                light: '#a5bad2',
            },
            background: {
                default: '#edf6ff',
            },
        },
    });

    const onGoogleSignIn = async () => {
        try {
            await doSignInWithGoogle();
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const logIn = async (e) => {
        e.preventDefault();
        try {
            await doSignInWithEmailAndPassword(email, password);
            setShowModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        try {
            await doCreateUserWithEmailAndPassword(email, password);
            setShowRegisterModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Job Application Tracker!
                    </Typography>
                    {userLoggedIn ? (
                        <>
                        <Typography>
                        {currentUser.displayName}{' '}
                        </Typography>
                            <IconButton color="inherit" onClick={handleMenuOpen}>
                                <Settings />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={() => {
                                    doSignOut();
                                    handleMenuClose();
                                }}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button color="inherit" onClick={handleAuthModal}>
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Login Modal */}
            <Modal open={showModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" textAlign="center" gutterBottom>
                        Welcome Back
                    </Typography>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={logIn}
                        sx={{ mt: 2 }}
                    >
                        Sign In
                    </Button>
                    <Typography textAlign="center" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Button onClick={handleRegisterModal}>Sign up</Button>
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onGoogleSignIn}
                        startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ height: '20px' }} />}
                    >
                        Continue with Google
                    </Button>
                    <Button
                        variant="text"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleCloseModal}
                    >
                        Cancel
                    </Button>
                </Box>
            </Modal>

            {/* Register Modal */}
            <Modal open={showRegisterModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" textAlign="center" gutterBottom>
                        Create a New Account
                    </Typography>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={onSubmit}
                        sx={{ mt: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Button
                        variant="text"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleCloseModal}
                    >
                        Cancel
                    </Button>
                </Box>
            </Modal>
        </ThemeProvider>
    );
};

export default Header;
