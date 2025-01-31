import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box,InputAdornment, IconButton } from '@mui/material';
import DownloadIcon from "@mui/icons-material/Download";
import { updateData } from './firebase/UpdateWrite';
import { fetchData } from './firebase/Read';
import { jsPDF } from "jspdf";

const JobDetail = ({ open, onClose, currentUser, job }) => {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [note, setNote] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobID, setJobID] = useState('');
  const [resumeComparison, setResumeComparison] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  

  useEffect(() => {

    const fetchCoverLetter = async () => {
      if (job?.coverLetterId) {
        try {
          const result = await fetchData(
            `users/${currentUser.uid}/CoverLetters/${job.coverLetterId}`
          );
          setCoverLetter(result?.CoverLetter || ""); // Ensure field exists
        } catch (error) {
          console.error("Error fetching cover letter:", error);
          setCoverLetter(""); // Handle errors gracefully
        }
      } else {
        setCoverLetter(""); // Default value if no ID
      }
    };

    if (job) {
      setUrl(job.url || '');
      setCompany(job.company || '');
      setRole(job.role || '');
      setSalary(job.salary || '');
      setNote(job.note || '');
      setJobDescription(job.jobDescription || '');
      setJobID(job.id || '');
      setResumeComparison(job.resumeComparison || '');
      setCoverLetter(job.coverLetterId || '');

      fetchCoverLetter();

    }
  }, [job, currentUser, fetchData]);

const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.text(coverLetter, 10, 10, { maxWidth: 180 }); // Ensures text wraps properly
    doc.save(`${currentUser.displayName}-${company}-${role}-CoverLetter.pdf`);
  };

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
    await updateData(`users/${currentUser.uid}/Jobs/${jobID}`, updatedFields);


      //console.log('Saved:', { url, company, role, salary, note, jobDescription });
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
          maxRows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="AI Review"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          maxRows={10}
          value={resumeComparison}
          onChange={(e) => setJobDescription(e.target.value)}
          sx={{ mb: 2 }}
          disabled
        />
        <TextField
            label="Cover Letter"
            value={coverLetter}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleDownload} color="primary">
                    <DownloadIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            disabled
            multiline
            minRows={3}
            maxRows={10}
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
