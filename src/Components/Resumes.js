import React, { useState, useEffect } from "react";
import { Button, Typography, CircularProgress, TextField, List, ListItem, ListItemIcon, ListItemText, Box } from "@mui/material";
import { Description } from "@mui/icons-material";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app, functions } from "./firebase/firebase"; // Adjust import path
import { httpsCallable } from 'firebase/functions';
import ReactMarkdown from 'react-markdown';

import * as PDFJS from 'pdfjs-dist';
//import 'pdfjs-dist/build/pdf.worker.entry';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs';

import { getDocument } from 'pdfjs-dist';

const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

const ResumesSection = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [tag, setTag] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFileURL, setSelectedFileURL] = useState("");
  const [selectedResumeText, setSelectedResumeText] = useState('');
  const [resumeComparison, setResumeComparison] = useState('');

    PDFJS.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.45/pdf.worker.mjs';

  useEffect(() => {
    fetchUserFiles();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === "application/pdf" || selectedFile.type.includes("text"))) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid PDF or text file.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setUploading(true);
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        setError("Upload failed. Try again.");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFileURL(downloadURL);
        setUploading(false);

        // Store file metadata in Firestore
        await addDoc(collection(db, "userFiles"), {
          userId,
          fileName: file.name,
          fileURL: downloadURL,
          tag,
          timestamp: new Date()
        });

        fetchUserFiles(); // Refresh the list
      }
    );
  };

  const fetchUserFiles = async () => {
    const userId = auth.currentUser.uid;
    const q = query(collection(db, "userFiles"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const filesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFiles(filesList);
  };



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
  
    const handleAnalyze = async (resume) => {
      const resumeText = await extractTextFromResume(resume);
      setSelectedResumeText(resumeText);
      setResumeComparison("Loading Analysis")
      setLoading(true);

      try {
        const compareResume = httpsCallable(functions, 'handle_request'); // Call the function
        const result = await compareResume({ 
            role: "user", 
            content: `Analyze my resume and provide a structured response with proper formatting. 
    
    ### **Score:**  
    [Score here]  
    
    ### **Strengths:**  
    1. [Strength 1]  
    2. [Strength 2]  
    3. [Strength 3]  
    
    ### **Gaps:**  
    1. [Gap 1]  
    2. [Gap 2]  
    3. [Gap 3]  
    
    ### **Improvements:**  
    1. [Improvement 1]  
    2. [Improvement 2]  
    3. [Improvement 3]  
    
    Ensure the response is well-structured with spaces and line breaks for readability.
    
    **Resume:**  
    ${resumeText}`
        }); 
    
        //console.log("Comparison Result:", result.data.response); // Log the response
        setResumeComparison(result.data.response)
        setLoading(false);
    } catch (error) {
        console.error("Error generating comparison:", error);
    }
    };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <input type="file" accept=".pdf,.txt" onChange={handleFileChange} />
      <TextField
        label="Tag (optional)"
        variant="outlined"
        size="small"
        style={{ marginLeft: "10px" }}
        onChange={(e) => setTag(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading || !file} style={{ margin: "10px" }}>
        Upload
      </Button>
      {uploading && <CircularProgress variant="determinate" value={progress} />}
      {error && <Typography color="error">{error}</Typography>}

      {/* Uploaded File Preview */}
      {fileURL && (
        <div style={{ marginTop: "10px" }}>
          <Typography variant="subtitle1">Uploaded File:</Typography>
          {file.type === "application/pdf" ? (
            <iframe src={fileURL} title="Resume Preview" width="100%" height="500px" />
          ) : (
            <a href={fileURL} target="_blank" rel="noopener noreferrer">View Resume</a>
          )}
        </div>
      )}

      {/* Previously Uploaded Files */}
      <Typography variant="h6" style={{ marginTop: "20px" }}>Your Uploaded Resumes</Typography>
      <List>
        {files.map((fileItem) => (
          <ListItem key={fileItem.id} button onClick={() => setSelectedFileURL(fileItem.fileURL)}>
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText primary={fileItem.fileName} secondary={fileItem.tag || "No tag"}/>
            <Button variant="outlined" size="small"  onClick={() => handleAnalyze(fileItem)}>
              Analyze
            </Button>
            <Button variant="outlined" size="small" href={fileItem.fileURL} target="_blank" download>
              Download
            </Button>
          </ListItem>
        ))}
      </List>

      {/* Selected File Preview */}
      {selectedFileURL && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="subtitle1">Selected File:</Typography>
          <iframe src={selectedFileURL} title="Selected Resume Preview" width="100%" height="400px" />
        </div>
      )}
        {loading && <CircularProgress />}
        {resumeComparison && (
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
          {/* <TextField
            label="Resume Comparison"
            value={resumeComparison}
            InputProps={{ readOnly: true }}
            variant="outlined"
            fullWidth
            disabled
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          /> */}
          <div style={{ width: '100%', wordWrap: 'break-word' }}>
            <ReactMarkdown>{resumeComparison}</ReactMarkdown>
          </div>
        </Box>
        )}
    </div>
  );
};

export default ResumesSection;
