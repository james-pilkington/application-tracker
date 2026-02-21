import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, 
  Box, IconButton, Grid, Typography, Chip, Paper, Divider
} from '@mui/material';
import DownloadIcon from "@mui/icons-material/Download";
import { updateData } from './firebase/UpdateWrite';
import { fetchData } from './firebase/Read';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';

const JobDetail = ({ open, onClose, currentUser, job }) => {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [note, setNote] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobID, setJobID] = useState('');
  
  // AI State Handling
  const [aiAnalysis, setAiAnalysis] = useState(null); // For new JSON format
  const [legacyComparison, setLegacyComparison] = useState(''); // For old string format
  const [coverLetter, setCoverLetter] = useState('');
  
  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (job?.coverLetterId) {
        try {
          const result = await fetchData(
            `users/${currentUser.uid}/CoverLetters/${job.coverLetterId}`
          );
          setCoverLetter(result?.CoverLetter || ""); 
        } catch (error) {
          console.error("Error fetching cover letter:", error);
          setCoverLetter(""); 
        }
      } else {
        setCoverLetter(""); 
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

      // Determine if resumeComparison is the new JSON or legacy string
      if (job.resumeComparison) {
        if (typeof job.resumeComparison === 'object') {
             // It's already an object (if saved directly from the updated AddJob)
             setAiAnalysis(job.resumeComparison);
             setLegacyComparison('');
        } else {
            try {
                // Try parsing it just in case it was saved as a JSON string
                const parsed = JSON.parse(job.resumeComparison);
                setAiAnalysis(parsed);
                setLegacyComparison('');
              } catch (e) {
                // If it fails to parse, it must be the old flat string format
                setLegacyComparison(job.resumeComparison);
                setAiAnalysis(null);
              }
        }
      } else {
          setAiAnalysis(null);
          setLegacyComparison('');
      }

      fetchCoverLetter();
    }
  }, [job, currentUser, fetchData]);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(coverLetter, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${currentUser.displayName}-${company}-${role}-CoverLetter.pdf`);
  };

  const handleSave = async () => {
    try {
      const today = new Date();
      const dateOnly = today.toISOString().split('T')[0];

      const updatedFields = { 
        url: url,
        company: company,
        role: role,
        salary: salary,
        note: note,
        lastUpdate: dateOnly,
        jobDescription: jobDescription
      };  
      
      await updateData(`users/${currentUser.uid}/Jobs/${jobID}`, updatedFields);
      onClose(); 
    } catch (error) {
      console.error('Error udpating data:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Job Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={4} sx={{ mt: 0 }}>
          
          {/* LEFT COLUMN - Inputs (Sticky) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 0, pt: 1 }}>
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <TextField label="ID" variant="standard" fullWidth value={jobID} disabled size="small" />
              </Box>
              <TextField label="URL" variant="outlined" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mb: 2 }} size="small" />
              
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <TextField label="Company" variant="outlined" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} size="small" />
                <TextField label="Role" variant="outlined" fullWidth value={role} onChange={(e) => setRole(e.target.value)} size="small" />
              </Box>

              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <TextField label="Salary" variant="outlined" fullWidth type="number" value={salary} onChange={(e) => setSalary(e.target.value)} size="small" />
                <TextField label="Note" variant="outlined" fullWidth value={note} onChange={(e) => setNote(e.target.value)} size="small" />
              </Box>

              <TextField
                label="Job Description" variant="outlined" fullWidth multiline minRows={10} maxRows={17}
                value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} sx={{ mb: 2 }}
              />
            </Box>
          </Grid>

          {/* RIGHT COLUMN - AI & Actions */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, height: '100%' }}>
              
              {/* If we have the NEW JSON Format */}
              {aiAnalysis && (
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" color={aiAnalysis.score > 74 ? 'success.main' : aiAnalysis.score > 49 ? 'warning.main' : 'error.main'}>
                      Match Score: {aiAnalysis.score}/100
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Top Missing/Target Tags:
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {Array.isArray(aiAnalysis?.top_tags) ? (
                      aiAnalysis.top_tags.map((item, idx) => (
                        <Chip 
                          key={idx} 
                          label={item.tag} 
                          color={item.match ? "success" : "error"} 
                          size="small"
                          variant={item.match ? "filled" : "outlined"} 
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="error">Failed to load tags.</Typography>
                    )}
                  </Box>

                  {/* Analysis */}
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Analysis:</Typography>
                  <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {aiAnalysis?.analysis || "No analysis provided."}
                  </Typography>

                  {/* Strengths */}
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Strengths:</Typography>
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                    {Array.isArray(aiAnalysis?.strengths) && aiAnalysis.strengths.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {aiAnalysis.strengths.map((strength, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <Typography variant="body2" color="text.primary">{strength}</Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No strengths identified.</Typography>
                    )}
                  </Box>

                  {/* Gaps */}
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Gaps:</Typography>
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
                    {Array.isArray(aiAnalysis?.gaps) && aiAnalysis.gaps.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {aiAnalysis.gaps.map((gap, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            <Typography variant="body2" color="text.primary">{gap}</Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No gaps identified.</Typography>
                    )}
                  </Box>

                  {/* Improvement Advice */}
                  {aiAnalysis?.improvement_advice && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Improvement Advice:</Typography>
                      <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        {aiAnalysis.improvement_advice}
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {/* If we have the LEGACY String Format */}
              {legacyComparison && (
                <TextField
                  label="Legacy AI Review"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={5}
                  value={legacyComparison}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 3, bgcolor: 'white' }}
                />
              )}

              {/* Cover Letter Display */}
              {coverLetter && (
                <Box sx={{ mt: aiAnalysis || legacyComparison ? 3 : 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cover Letter:
                    </Typography>
                    <IconButton 
                      onClick={handleDownload} 
                      size="small" 
                      sx={{ color: 'text.primary' }}
                      title="Download PDF"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'white',
                      border: '1px solid #c4c4c4', 
                      borderRadius: 1,
                      minHeight: '130px', 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                      fontSize: '1rem',
                      lineHeight: '1.4375em',
                      color: 'text.primary',
                      '& p': { mb: 1.5 }, 
                      '& ul': { pl: 3, mb: 1.5 }, 
                      '& li': { mb: 0.5 }, 
                    }}
                  >
                    <ReactMarkdown>
                      {coverLetter}
                    </ReactMarkdown>
                  </Paper>
                </Box>
              )}

            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disableElevation>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetail;