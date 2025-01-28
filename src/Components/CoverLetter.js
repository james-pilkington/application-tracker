import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export default function CoverLettersSection() {
  const [coverLetterText, setCoverLetterText] = useState('');

  const handleSave = () => {
    // Placeholder function to handle save logic
    console.log('Save function triggered:', coverLetterText);
  };

  const handleDownloadDocx = () => {
    const blob = new Blob([coverLetterText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'CoverLetter.docx');
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text(coverLetterText, 10, 10);
    doc.save('CoverLetter.pdf');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Create Your Cover Letter</Typography>
      <TextField
        label="Cover Letter"
        multiline
        rows={10}
        variant="outlined"
        value={coverLetterText}
        onChange={(e) => setCoverLetterText(e.target.value)}
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleDownloadDocx}>
          Download as .docx
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleDownloadPdf}>
          Download as .pdf
        </Button>
      </Box>
    </Box>
  );
}