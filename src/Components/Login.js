import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Button, Modal, TextField, Divider } from '@mui/material';
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doCreateUserWithEmailAndPassword } from './firebase/auth';


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

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    // const [isSigningIn, setIsSigningIn] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    // const [isRegistering, setIsRegistering] = useState(false);
    const [showModal, setShowModal] = useState(true);

     const handleAuthModal = () => setShowModal(true);
        const handleRegisterModal = () => {
            setShowModal(false);
            setShowRegisterModal(true);
        };
        const handleCloseModal = () => {
            setShowModal(false);
            setShowRegisterModal(false);
        };
    
        const onGoogleSignIn = async () => {
            try {
                // setIsSigningIn(true);
                await doSignInWithGoogle();
                setShowModal(false);
            } catch (err) {
                console.error(err);
            } finally {
                // setIsSigningIn(false);
            }
        };
    
        // const onSubmit = async (e) => {
            //             e.preventDefault()
            //             if(!isRegistering) {
            //                 setIsRegistering(true)
            //                 await doCreateUserWithEmailAndPassword(email, password)
            //             }
            //         }
            
        const logIn = async (e) => {
            e.preventDefault();
            try {
                // setIsSigningIn(true);
                await doSignInWithEmailAndPassword(email, password);
                setShowModal(false);
            } catch (err) {
                console.error(err);
            } finally {
                // setIsSigningIn(false);
            }
        };
    
        const onSubmit = async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                alert("Passwords don't match!");
                return;
            }
            try {
                // setIsRegistering(true);
                await doCreateUserWithEmailAndPassword(email, password);
                setShowRegisterModal(false);
            } catch (err) {
                console.error(err);
            } finally {
                // setIsRegistering(false);
            }
        };

  return (

    <>

<Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f5f5f5", // Optional background color
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
         <img
        src="https://via.placeholder.com/150"
        alt="Job Tracker Welcome"
        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      />
      <Typography variant="h4" gutterBottom>
        Welcome to the Job Application Tracker!
      </Typography>
      <Typography variant="h5" gutterBottom>
        Login to get started
      </Typography>
      <Button
                        variant="text"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleAuthModal}
                    >
                        Login
                    </Button>


    </Box>

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
        </>

  )
}
