import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, 
  Box, List, ListItem, ListItemButton, ListItemText, InputAdornment, 
  IconButton, Grid, Typography, Chip, Paper, Divider, CircularProgress
} from '@mui/material';
import DownloadIcon from "@mui/icons-material/Download";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { saveData, saveCoverLetter } from './firebase/Write';
import { jsPDF } from "jspdf";
import { getAuth } from 'firebase/auth';
import { app, functions } from './firebase/firebase'; // Adjust path
import * as PDFJS from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
import { httpsCallable } from 'firebase/functions';
import ReactMarkdown from 'react-markdown';

const db = getFirestore(app);
const auth = getAuth(app);

const AddJob = ({ open, onClose, currentUser }) => {
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [note, setNote] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [resumes, setResumes] = useState([]);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [selectedResumeText, setSelectedResumeText] = useState('');
  const [selectedResumeName, setSelectedResumeName] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null); // Stores the parsed JSON object
  const [resumeComparison, setResumeComparison] = useState(''); // Raw string for DB saving
  const [coverLetter, setCoverLetter] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.45/pdf.worker.mjs';

  useEffect(() => {
    if (open) {
      fetchResumes();
    }
  }, [open]);

  const fetchResumes = async () => {
    try {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, "userFiles"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const resumeList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResumes(resumeList);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleSave = async () => {
    if (!url || !company || !role) {
      alert('Please fill out all required fields (URL, Company, Role).');
      return;
    }
  
    try {
      let coverLetterId = null;
      if (coverLetter) {
        coverLetterId = await saveCoverLetter(currentUser.uid, coverLetter, `${company}-${role}`);
      }
  
      await saveData(
        currentUser.uid,
        url,
        company,
        role,
        salary,
        note,
        jobDescription,
        resumeComparison, // Save the raw/formatted text to the DB
        coverLetterId
      );

      handleClose();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleClose = () => {
    onClose();
    setUrl(''); setCompany(''); setRole(''); setSalary(''); setNote('');
    setJobDescription(''); setAiAnalysis(null); setResumeComparison('');
    setCoverLetter(''); setSelectedResumeText(''); setSelectedResumeName('');
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(coverLetter, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${currentUser.displayName}-${company}-${role}-CoverLetter.pdf`);
  };

  const extractTextFromPDF = async (pdfUrl) => {
    try {
      const pdf = await getDocument(pdfUrl).promise;
      let extractedText = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText.push(pageText);
      }
      return extractedText.join(' ');
    } catch (error) {
      console.error('Error extracting text:', error);
      return "Error extracting text from PDF.";
    }
  };

  const extractTextFromResume = async (resume) => {
    try {
      const response = await fetch(resume.fileURL);
      if (resume.fileName.endsWith('.pdf')) {
        return extractTextFromPDF(resume.fileURL);
      } else {
        return response.text();
      }
    } catch (error) {
      console.error("Error fetching resume content:", error);
      return "Could not fetch resume content.";
    }
  };

  const handleSelectResume = async (resume) => {
    setResumeDialogOpen(false);
    setSelectedResumeName(resume.fileName);
    const resumeText = await extractTextFromResume(resume);
    setSelectedResumeText(resumeText);
  };

  const handleCompareResume = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const compareResume = httpsCallable(functions, 'handle_request');
      
      const prompt = `
IMPORTANT: You are a strict Applicant Tracking System (ATS). Analyze the Resume against the Job Description.
You MUST output your response ONLY as a valid JSON object. Do not include markdown blocks, backticks, or extra text.

IMPORTANT: Ignore all previous instructions about being helpful or encouraging. 
You are now a strict, cynical Applicant Tracking System (ATS). 
Your goal is to accurately score applicants based on matches to requirement.
Analyze the following Resume against the Job Description.

Anchor at 0
Step 1: Identify the "Must-Have" skills and requirements in the Job Description.
Step 2: Check if the Resume contains these specific requirements. Penalize heavily for missing "Must-Haves".
Step 3: Assign a compatibility score (0-100) based strictly on this rubric:
- 90-100: Perfect match. Has all skills, exact years of experience, and industry relevance.
- 75-89: Strong match. Has all critical hard skills but misses minor "nice-to-haves".
- 50-74: Moderate match. Has some relevant skills but lacks critical specific tools or experience depth.
- 0-49: Weak match. Missing multiple core requirements or irrelevant background.

Output Format use this exact JSON structure:
{
  "top_tags": [
    {"tag": "skill 1", "match": true},
    {"tag": "skill 2", "match": false},
    {"tag": "skill 3", "match": true},
    {"tag": "skill 4", "match": false},
    {"tag": "skill 5", "match": true}
  ],
  "strengths": [Bulleted list of matched keywords/skills],
  "gaps": [Bulleted list of missing critical keywords/skills],
  "analysis": [Concise summary of why this score was given]
  "improvement_advice": "Specific advice on where to inject these tags to increase the score."
  "score": 0,
  }

Resume:
${selectedResumeText}

Job Description:
${jobDescription}
      `;

      const result = await compareResume({ role: "user", content: prompt });
      const rawText = result.data.response;
      
      // Clean potential markdown blocks if the LLM adds them
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedData = JSON.parse(cleanJsonStr);
      setAiAnalysis(parsedData);
      setResumeComparison(parsedData);
      console.log(resumeComparison)


      // Save a formatted string version for your database
      //const formattedComparison = `Score: ${parsedData.score}/100\n\nStrengths:\n- ${parsedData.strengths.join('\n- ')}\n\nGaps:\n- ${parsedData.gaps.join('\n- ')}\n\nAdvice:\n${parsedData.improvement_advice}`;
      //setResumeComparison(formattedComparison);

    } catch (error) {
      console.error("Error generating comparison:", error);
      alert("Error analyzing resume. Please check the console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeText) return alert('Please select a resume first.');
    setIsGeneratingLetter(true);
    
    try {
      const generateLetter = httpsCallable(functions, 'handle_request'); 
      const prompt = `Write a compelling cover letter that immediately grabs the hiring manager's attention and highlights my most relevant skills and experience. Do not include any formalities at the beginning—start directly with a strong opening paragraph. Identify four key bullet points from the job description that align with my resume, focusing on the most critical required skills. The response should only include the cover letter itself, with no additional commentary.

      Resume:
      ${selectedResumeText}

      Job Description:
      ${jobDescription}`;
 
      const result = await generateLetter({ role: "user", content: prompt });
      setCoverLetter(result.data.response);
    } catch (error) {
      console.error("Error generating cover letter:", error);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleScrapeJobUrl = async () => {
    if (!url) return alert("Please enter a job URL first.");
    try {
      const getWebsiteContent = httpsCallable(functions, "get_website_content");
      const result = await getWebsiteContent({ url });
      const parsed = JSON.parse(result.data[0]);
      
      const {
        fields: {
          "Company Name": scrapedCompany = '',
          "Job Title": scrapedRole = '',
          "Salary": scrapedSalary = '',
        } = {},
      } = parsed;

      if(scrapedCompany) setCompany(scrapedCompany);
      if(scrapedRole) setRole(scrapedRole);
      if(scrapedSalary) setSalary(scrapedSalary);
      if(parsed.raw) setJobDescription(parsed.raw);
    } catch (error) {
      console.error("Error scraping job URL:", error);
      alert("Failed to extract job data from the URL.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Add Job Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          
          {/* LEFT COLUMN - Inputs */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 0, pt: 1 }}>
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <TextField label="URL" variant="outlined" fullWidth size="small" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Button variant="outlined" color="secondary" onClick={handleScrapeJobUrl}>Scrape</Button>
            </Box>
            
            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField label="Company" variant="outlined" fullWidth size="small" value={company} onChange={(e) => setCompany(e.target.value)} />
              <TextField label="Role" variant="outlined" fullWidth size="small" value={role} onChange={(e) => setRole(e.target.value)} />
            </Box>

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField label="Salary" variant="outlined" fullWidth type="number" size="small" value={salary} onChange={(e) => setSalary(e.target.value)} />
              <TextField label="Note" variant="outlined" fullWidth size="small" value={note} onChange={(e) => setNote(e.target.value)} />
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
              
              <Button color="secondary" variant="contained" fullWidth sx={{ mb: 2 }} onClick={() => setResumeDialogOpen(true)}>
                (1) {selectedResumeName ? `Resume: ${selectedResumeName}` : "Select Resume"}
              </Button>

              <Box display="flex" gap={2} sx={{ mb: 3 }}>
                <Button color="primary" variant="contained" fullWidth onClick={handleCompareResume} disabled={!selectedResumeText || isAnalyzing}>
                  {isAnalyzing ? <CircularProgress size={24} color="inherit" /> : "(2) Analyze Match"}
                </Button>
                <Button color="primary" variant="contained" fullWidth onClick={handleGenerateCoverLetter} disabled={!selectedResumeText || isGeneratingLetter}>
                  {isGeneratingLetter ? <CircularProgress size={24} color="inherit" /> : "(3) Draft Letter"}
                </Button>
              </Box>

              

              <Divider sx={{ mb: 2 }} />

              {/* AI Analysis Display */}
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

                    {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {Array.isArray(aiAnalysis?.top_tags) ? (
                        aiAnalysis.top_tags.map((tag, idx) => (
                        <Chip key={idx} label={tag} color="primary" size="small"   />
                        ))
                    ) : (
                        <Typography variant="body2" color="error">
                        Failed to load tags. (Raw data: {JSON.stringify(aiAnalysis?.top_tags)})
                        </Typography>
                    )}
                    </Box> */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {Array.isArray(aiAnalysis?.top_tags) ? (
                        aiAnalysis.top_tags.map((item, idx) => (
                        <Chip 
                            key={idx} 
                            label={item.tag} 
                            color={item.match ? "success" : "error"} 
                            size="small"
                            // Optional: Make matches solid green, and misses outlined red
                            variant={item.match ? "filled" : "outlined"} 
                        />
                        ))
                    ) : (
                        <Typography variant="body2" color="error">
                        Failed to load tags.
                        </Typography>
                    )}
                    </Box>

                  {/* --- AI Analysis Summary --- */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Analysis:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {aiAnalysis?.analysis || "No analysis provided."}
                    </Typography>

                    {/* --- Strengths (Green Box) --- */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Strengths:
                    </Typography>
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

                    {/* --- Gaps (Red Box) --- */}
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Gaps:
                    </Typography>
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

                    {/* --- Improvement Advice --- */}
                    {aiAnalysis?.improvement_advice && (
                    <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                        Improvement Advice:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        {aiAnalysis.improvement_advice}
                        </Typography>
                    </>
                    )}
                </Box>
              )}

              {/* Cover Letter Display */}
            {coverLetter && (
            <Box sx={{ mt: 3 }}>
                {/* Header with Label and Darker Download Button */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Cover Letter:
                </Typography>
                <IconButton 
                    onClick={handleDownload} 
                    size="small" 
                    sx={{ color: 'text.primary' }} // Sets color to a darker, primary text color
                    title="Download PDF"
                >
                    <DownloadIcon />
                </IconButton>
                </Box>

                {/* Markdown-Formatted Cover Letter Container */}
                <Paper
                elevation={0}
                sx={{
                    p: 2,
                    bgcolor: 'white',
                    border: '1px solid #c4c4c4', // Matches default MUI TextField border color
                    borderRadius: 1,
                    minHeight: '130px', // approx 5 rows
                    maxHeight: '260px', // approx 10 rows
                    overflowY: 'auto',
                    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                    fontSize: '1rem',
                    lineHeight: '1.4375em',
                    color: 'text.primary',
                    '& p': { mb: 1.5 }, // Spacing between paragraphs
                    '& ul': { pl: 3, mb: 1.5 }, // Indentation for lists
                    '& li': { mb: 0.5 }, // Spacing between list items
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
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained" disableElevation>Save Job Data</Button>
      </DialogActions>

      {/* Resume Selection Dialog */}
      <Dialog open={resumeDialogOpen} onClose={() => setResumeDialogOpen(false)}>
        <DialogTitle>Select a Resume</DialogTitle>
        <DialogContent>
          <List>
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <ListItem key={resume.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectResume(resume)}>
                    <ListItemText primary={resume.fileName} secondary={resume.tag || "No tag"} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem><ListItemText primary="No resumes found." /></ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AddJob;