import React, { useState, useEffect } from "react";
import { Button, Typography, CircularProgress, TextField, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Description } from "@mui/icons-material";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./firebase/firebase"; // Adjust import path

const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

const ResumesSection = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [tag, setTag] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFileURL, setSelectedFileURL] = useState("");

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
            <ListItemText primary={fileItem.fileName} secondary={fileItem.tag || "No tag"} />
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
          <iframe src={selectedFileURL} title="Selected Resume Preview" width="100%" height="500px" />
        </div>
      )}
    </div>
  );
};

export default ResumesSection;
