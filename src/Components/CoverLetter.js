import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { saveCoverLetter } from './firebase/Write';
import { fetchData } from './firebase/Read';
import { useAuth } from '../contexts/authContext';

export default function CoverLettersSection() {
  const [coverLetterText, setCoverLetterText] = useState('');
  const [tag, setTag] = useState('');
  const [coverLetters, setCoverLetters] = useState([]);
  const { currentUser } = useAuth();

  // Fetch saved cover letters from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const fetchCoverLetters = async () => {
      try {
        const result = await fetchData(`users/${currentUser.uid}/CoverLetters`);
        if (result) {
          setCoverLetters(Object.entries(result).map(([id, data]) => ({ id, ...data })));
        }
      } catch (error) {
        console.error("Error fetching cover letters:", error);
      }
    };

    fetchCoverLetters();
  }, [currentUser]);

  const handleSave = async () => {
    if (!coverLetterText.trim() || !tag.trim()) {
      alert('Please enter a tag and cover letter text.');
      return;
    }

    try {
      await saveCoverLetter(currentUser.uid, coverLetterText, tag);
      alert('Cover letter saved successfully!');

      // Refresh cover letter list
      setCoverLetters([...coverLetters, { id: Date.now().toString(), text: coverLetterText, tag }]);

      // Clear inputs
      setCoverLetterText('');
      setTag('');
    } catch (error) {
      console.error('Error saving cover letter:', error);
      alert('Failed to save. Please try again.');
    }
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

  const handleSelectCoverLetter = (letter) => {
    setCoverLetterText(letter.text);
    setTag(letter.tag);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Create Your Cover Letter</Typography>
      
      <TextField
        label="Cover Letter Title / Tag"
        variant="outlined"
        fullWidth
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />

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

      {/* Saved Cover Letters List */}
      <Typography variant="h6" sx={{ mt: 3 }}>Saved Cover Letters</Typography>
      <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
        <List>
          {coverLetters.length > 0 ? (
            coverLetters.map((letter) => (
              <ListItem key={letter.id} disablePadding>
                <ListItemButton onClick={() => handleSelectCoverLetter(letter)}>
                  <ListItemText primary={letter.tag} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2, textAlign: 'center' }}>No saved cover letters.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
}
