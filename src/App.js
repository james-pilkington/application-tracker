// import * as React from 'react';
// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import CssBaseline from '@mui/material/CssBaseline';
// import Divider from '@mui/material/Divider';
// import Drawer from '@mui/material/Drawer';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import Toolbar from '@mui/material/Toolbar';
// import HomeIcon from '@mui/icons-material/Home';
// import DescriptionIcon from '@mui/icons-material/Description';
// import CreateIcon from '@mui/icons-material/Create';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import HomeSection from './Components/Home';
// import ResumesSection from './Components/Resumes';
// import CoverLettersSection from './Components/CoverLetter';
// import Login from './Components/Login';
// import Header from './Components/Header';
// import { Container } from '@mui/material';

// // Import AuthProvider and HashRouter
// import { AuthProvider, useAuth } from './contexts/authContext';
// import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';

// const drawerWidth = 240;

// function ResponsiveDrawer(props) {
//   const { window } = props;
//   const [mobileOpen, setMobileOpen] = React.useState(false);

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen);
//   };
 
//   const { userLoggedIn } = useAuth(); // Use auth context

//   const darkTheme = createTheme({
//     palette: {
//       primary: { main: '#0b061a' },
//       secondary: { main: '#151A06' },
//     },
//   });

//   const drawer = (
//     <div>
//       <Toolbar />
//       <Divider />
//       <List>
//         <ListItem disablePadding>
//           <ListItemButton component="a" href="#/">
//             <ListItemIcon>
//               <HomeIcon />
//             </ListItemIcon>
//             <ListItemText primary="Home" />
//           </ListItemButton>
//         </ListItem>
//         <ListItem disablePadding>
//           <ListItemButton component="a" href="#/resumes">
//             <ListItemIcon>
//               <DescriptionIcon />
//             </ListItemIcon>
//             <ListItemText primary="Resumes" />
//           </ListItemButton>
//         </ListItem>
//         <ListItem disablePadding>
//           <ListItemButton component="a" href="#/cover-letters">
//             <ListItemIcon>
//               <CreateIcon />
//             </ListItemIcon>
//             <ListItemText primary="Cover Letters" />
//           </ListItemButton>
//         </ListItem>
//       </List>
//       <Divider />
//     </div>
//   );

//   const container = window !== undefined ? () => window().document.body : undefined;

//   if (!userLoggedIn) {
//     return <Login />; // Render the Login component if the user is not logged in
//   }

//   return (
//     <ThemeProvider theme={darkTheme}>
//       <Box sx={{ display: 'flex' }}>
//         <CssBaseline />
//         <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//           <Header />
//         </AppBar>
//         <Box
//           component="nav"
//           sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
//           aria-label="sections"
//         >
//           <Drawer
//             container={container}
//             variant="temporary"
//             open={mobileOpen}
//             onClose={handleDrawerToggle}
//             ModalProps={{
//               keepMounted: true,
//             }}
//             sx={{
//               display: { xs: 'block', sm: 'none' },
//               '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//             }}
//           >
//             {drawer}
//           </Drawer>
//           <Drawer
//             variant="permanent"
//             sx={{
//               display: { xs: 'none', sm: 'block' },
//               '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, marginTop: '64px' },
//             }}
//             open
//           >
//             {drawer}
//           </Drawer>
//         </Box>
//         <Box
//           component="main"
//           sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, marginTop: '64px' }}
//         >
//           <Toolbar />
//           <Container maxWidth="lg">
//             <Routes>
//               <Route path="/" element={<HomeSection />} />
//               <Route path="/resumes" element={<ResumesSection />} />
//               <Route path="/cover-letters" element={<CoverLettersSection />} />
//               <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//           </Container>
//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }

// // Wrap the app in HashRouter and AuthProvider
// export default function App(props) {
//   return (
//     <AuthProvider>
//       <HashRouter>
//         <ResponsiveDrawer {...props} />
//       </HashRouter>
//     </AuthProvider>
//   );
// }

import React from "react";
import { AppBar, Box, Container, CssBaseline, Tab, Tabs } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider, useAuth } from "./contexts/authContext";
import HomeSection from "./Components/Home";
import ResumesSection from "./Components/Resumes";
import CoverLettersSection from "./Components/CoverLetter";
import Login from "./Components/Login";
import Header from './Components/Header';
import JobSearchArticle from './Components/satic'

const darkTheme = createTheme({
  palette: {
    primary: { main: "#0b061a" },
    secondary: { main: "#151A06" },
  },
});

function AppContent() {
  const { userLoggedIn } = useAuth();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return <HomeSection />;
      case 1:
        return <ResumesSection />;
      case 2:
        return <CoverLettersSection />;
      case 3:
        return <JobSearchArticle />;
      default:
        return <HomeSection />;
    }
  };

  if (!userLoggedIn) {
    return <Login />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ flexGrow: 1 }} marginBottom='100px'>
        <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
           <Header />
         </AppBar>
         <Box
           component="main"
           sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}
         >
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Applications" />
          <Tab label="Resumes" />
          <Tab label="Cover Letters"/>
          <Tab label="Further Tips"/>
        </Tabs>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {renderTabContent()}
        </Container>
      </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


