import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box } from '@mui/material';
import { updateData } from './firebase/UpdateWrite';

const JobDetail = ({ open, onClose, currentUser, job }) => {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [note, setNote] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobID, setJobID] = useState('');

  

  useEffect(() => {
    if (job) {
      setUrl(job.url || '');
      setCompany(job.company || '');
      setRole(job.role || '');
      setSalary(job.salary || '');
      setNote(job.note || '');
      setJobDescription(job.jobDescription || '');
      setJobID(job.id || '');
    }
  }, [job]);



  const handleSave = async () => {
    try {
    //   if (!url || !company || !role || !salary) {
    //     alert('Please fill out all required fields.');
    //     return;
    //   }

    //   // Save to Firebase or any other database
    //   await saveData(currentUser.uid, url, company, role, salary, note, jobDescription);
    const today = new Date();
    const dateOnly = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const updatedFields = { 
        url: url,
      company: company,
      role: role,
      salary: salary,
      note: note,
      lastUpdate: dateOnly,
      jobDescription: jobDescription
    
    };  
    // Update data in Firebase
    await updateData(`users/${currentUser.uid}/${jobID}`, updatedFields);


      console.log('Saved:', { url, company, role, salary, note, jobDescription });
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error udpating data:', error);
      //alert('Failed to save data. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{job ? 'Edit Job Details' : 'Add Job Details'}</DialogTitle>
      <DialogContent>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <TextField
            label="ID"
            variant="standard"
            fullWidth
            value={jobID}
            disabled
          />
        </Box>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <TextField
            label="URL"
            variant="outlined"
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
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

export default JobDetail;
