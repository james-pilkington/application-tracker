import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';
import { saveData } from './firebase/Write'; // Assuming saveData handles Firebase writes

const AddJob = ({ open, onClose, currentUser }) => {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [note, setNote] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleSave = async () => {
    try {
      if (!url || !company || !role || !salary) {
        alert('Please fill out all required fields.');
        return;
      }

      // Save to Firebase or any other database
      await saveData(currentUser.uid, url, company, role, salary, note, jobDescription );

      console.log('Saved:', { url, company, role, salary, note, jobDescription });
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

//   const handleScrape = () => {
//     // Placeholder for the URL scraping logic
//     console.log('Scraping data from:', url);
//     // Add logic here later to fetch data from the given URL
//   };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Job Details</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {/* <Button onClick={handleScrape} color="primary" variant="outlined">
            Scrape
          </Button> */}
        </Box>
        <TextField
          label="Company"
          variant="outlined"
          fullWidth
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Role"
          variant="outlined"
          fullWidth
          value={role}
          onChange={(e) => setRole(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Salary"
          variant="outlined"
          fullWidth
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Note"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Job Description"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddJob;
