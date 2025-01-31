import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { saveData, saveCoverLetter } from './firebase/Write';
//import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { app } from './firebase/firebase'; // Adjust path
import * as PDFJS from 'pdfjs-dist';
//import 'pdfjs-dist/build/pdf.worker.entry';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs';

import { getDocument } from 'pdfjs-dist';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/firebase';
//import 'pdfjs-dist/build/pdf.worker.min.js';


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
  const [resumeComparison, setResumeComparison] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  //GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js';
  PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.45/pdf.worker.mjs';

  
  useEffect(() => {
      fetchResumes();
  }, []);

  //const storage = getStorage();
  
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
      alert('Please fill out all required fields.');
      return;
    }
  
    try {
      let coverLetterId = null;
  
      // If there's a cover letter, save it first and get the ID
      if (coverLetter) {
        coverLetterId = await saveCoverLetter(currentUser.uid, coverLetter, `${company}-${role}`);
      }
  
      // Save job data with the coverLetterId (if it exists)
      await saveData(
        currentUser.uid,
        url,
        company,
        role,
        salary,
        note,
        jobDescription,
        resumeComparison,
        coverLetterId // Pass the ID (null if no cover letter)
      );

      onClose();
      setUrl('');
      setCompany('');
      setSalary('');
      setNote('');
      setJobDescription('');
      setResumeComparison('');
      setCoverLetter('');

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  // const extractTextFromPDF = async (pdfUrl) => {
  //   try {
  //     console.log("starting", pdfUrl )
  //     //PDFJS.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js';
  //     const pdf = await getDocument(pdfUrl).promise;
  //     let extractedText = '';
  //     console.log("pdf:",pdf)

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       const textContent = await page.getTextContent();

  //       textContent.items.forEach((item) => {
  //         extractedText += item.str + ' ';
  //       });
  //     }

  //     return extractedText;
  //   } catch (error) {
  //     console.error('Error extracting text:', error);
  //   }

  // };

  const extractTextFromPDF = async (pdfUrl) => {
    try {
      const pdf = await getDocument(pdfUrl).promise;
      let extractedText = [];
  
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
  
        // Collect text items instead of mutating a variable inside a loop
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText.push(pageText);
      }
  
      return extractedText.join(' '); // Return text as a single string
    } catch (error) {
      console.error('Error extracting text:', error);
      return "Error extracting text from PDF.";
    }
  };
  

  const extractTextFromResume = async (resume) => {
    try {
      const response = await fetch(resume.fileURL);
      //const arrayBuffer = await response.arrayBuffer();
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
    const resumeText = await extractTextFromResume(resume);
    setSelectedResumeText(resumeText);
    //console.log(`Compare this resume:\n${resumeText}\n\nTo this job:\n${jobDescription}`);

  //   try {
  //     const compareResume = httpsCallable(functions, 'compare_resume'); // Call the function
  //     const result = await compareResume({ resume: resumeText, job_description: jobDescription });
  //     console.log(resumeText, jobDescription)
  //     console.log("Comparison Result:", result); // Log the response
  // } catch (error) {
  //     console.error("Error calling Firebase function:", error);
  // }

};


const handleCompareResume = async () => {
  try {
    const compareResume = httpsCallable(functions, 'handle_request'); // Call the function
    const result = await compareResume({ 
        role: "user", 
        content: `Compare my resume to the given job description. Provide a concise analysis highlighting strengths and gaps. Assign a compatibility score from 0 to 100, based on how well my resume aligns with the job requirements. Keep the response in this format [Strenghts:.. Gaps:.. Score:].\n\nResume:\n${selectedResumeText}\n\nJob Description:\n${jobDescription}`
    });

    //console.log("Comparison Result:", result.data.response); // Log the response
    setResumeComparison(result.data.response)
} catch (error) {
    console.error("Error generating comparison:", error);
}


  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeText) {
      alert('Please select a resume first.');
      return;
    }
    //console.log(`Generate a cover letter for this job:\n${jobDescription}\n\nUsing my resume:\n${selectedResumeText}`);
    try {
      const compareResume = httpsCallable(functions, 'handle_request'); // Call the function
      const result = await compareResume({ 
          role: "user", 
          content: `Write a compelling cover letter that grabs the attention of the hiring manager and highlights the my relevant skills and experience: Make a memorable first impression with a cover letter that stands out from the crowd. Exclude any formalities at the beginning, start wiht the openting paragraph and don't add an system response at the end, only the cover letter should be returned\n\nResume:\n${selectedResumeText}\n\nJob Description:\n${jobDescription}`
      });
  
      console.log("Comparison Result:", result.data.response); // Log the response
      setCoverLetter(result.data.response)
  } catch (error) {
      console.error("Error generating cover letter:", error);
  }
  };

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
         <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <Button color="secondary" variant="contained" fullWidth onClick={() => setResumeDialogOpen(true)}>
            (1) Select Resume
          </Button>
        </Box>
        <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <Button color="primary" variant="contained" fullWidth onClick={handleCompareResume} disabled={!selectedResumeText}>
            (2) Analyze against Resume
          </Button>
          <Button color="primary" variant="contained" fullWidth onClick={handleGenerateCoverLetter} disabled={!selectedResumeText}>
            (3) Generate Cover Letter
          </Button>
        </Box>
          {resumeComparison && (
          <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <TextField
            label="Resume Comparison"
            value={resumeComparison}
            InputProps={{ readOnly: true }}
            variant="outlined"
            fullWidth
            disabled
            multiline
            minRows={3}
            maxRows={10}
            sx={{ mb: 2 }}
          />
          </Box>   
        )}
        {coverLetter && (
          <Box display="flex" gap={2} sx={{ mt: 2 }}>
          <TextField
            label="Cover Letter"
            value={coverLetter}
            InputProps={{ readOnly: true }}
            variant="outlined"
            fullWidth
            disabled
            multiline
            minRows={3}
            maxRows={10}
            sx={{ mb: 2 }}
          />
          </Box>   
        )}

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
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
              <ListItem>
                <ListItemText primary="No resumes found." />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AddJob;