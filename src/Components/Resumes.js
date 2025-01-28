import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function ResumesSection() {
  return (
    <Box>
      {/* Hero Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          RESUME
        </Typography>
      </Paper>
    </Box>
  );
}
