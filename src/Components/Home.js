import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, Menu, MenuItem, createTheme, ThemeProvider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useAuth } from '../contexts/authContext';
import { fetchData } from './firebase/Read'; // Assume updateData updates job status in Firebase
import AddJob from './AddJob';
import SearchIcon from '@mui/icons-material/Search';
import { updateData } from './firebase/UpdateWrite';
import JobDetail from './Detail';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SankeyChart from './Sankey/SankeyChart';

export default function HomeSection() {
  const [addJob, setAddJob] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState({ active: [], applied: [], ghosted: [], rejected: [] });
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const { currentUser } = useAuth();
//   const [sankeyData, setSankeyData] = useState({ nodes: [], links: [] });
  

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6daffe',
      light: '#a5bad2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#edf6ff',
    },
  },
});

const statusColors = {
  Applied: "#b0b0b0", // Grey
  "HR Interview": "#ffcc80", // Light amber
  "Hiring Manager Interview": "#ffa726", // Amber
  "Peer Interviews": "#ff9800", // Darker amber
  Offer: "#4caf50", // Green
  Rejected: "#e57373", // Red
};

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const result = await fetchData("users/" + currentUser.uid + "/Jobs");
        if (result) {
          setJobs(Object.values(result));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, [currentUser]);

  useEffect(() => {
    // Group jobs into categories
    //const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const active = jobs.filter(job => ['HR Interview', 'Hiring Manager Interview', 'Peer Interviews','Offer'].includes(job.status));
    const applied = jobs.filter(job => job.status === 'Applied' && new Date(job.dateApplied) >= oneMonthAgo);
    const ghosted = jobs.filter(job => job.status === 'Applied' && new Date(job.dateApplied) < oneMonthAgo);
    const rejected = jobs.filter(job => job.status === 'Rejected');

    const searchFilteredJobs = (category) =>
      category.filter(job =>
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setFilteredJobs({
      active: searchFilteredJobs(active),
      applied: searchFilteredJobs(applied),
      ghosted: searchFilteredJobs(ghosted),
      rejected: searchFilteredJobs(rejected),
    });
  }, [jobs, searchTerm]);

  const handleCloseModal = () => {
    setAddJob(false);
    setOpenDetail(false);
  }

  const handleStatusClick = (event, job) => {
    setStatusAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const statusRank = {
    "Applied": 1,
    "HR Interview": 2,
    "Hiring Manager Interview": 3,
    "Peer Interviews": 4,
    "Offer":5,
    "Rejected": 0, // Lowest rank for "Rejected"
  };


  const handleStatusChange = async (newStatus) => {
    if (selectedJob) {
      const newStatusRank = statusRank[newStatus];
      const currentMaxStatusRank = statusRank[selectedJob.maxStatus || selectedJob.status];
  
      try {
        // Prepare the updated fields
        const updatedFields = { 
          status: newStatus,
          previousStatus: selectedJob.status, 
        };
  
        // Update max status if the new status is greater
        if (newStatusRank > currentMaxStatusRank) {
          updatedFields.maxStatus = newStatus; // Update maxStatus field
        }
  
        // Update data in Firebase
        await updateData(`users/${currentUser.uid}/Jobs/${selectedJob.id}`, updatedFields);
  
        // Update local state
        setJobs((prevJobs) =>
          prevJobs.map(job =>
            job.id === selectedJob.id
              ? { ...job, ...updatedFields }
              : job
          )
        );
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  
    setStatusAnchorEl(null);
    setSelectedJob(null);
  };

// const recordId = "firebase_unique_id"; // Retrieved from fetchData
// const path = `users/${currentUser.uid}/${recordId}`;
// const updatedData = { status: "Interviewing" };

// await updateData(path, updatedData);


  return (
    <ThemeProvider theme={theme}>
    <Box>
      {/* Add Job and Search Bar */}
      <Box display="flex" alignItems="center" mb={3}>
        <TextField
          variant="outlined"
          placeholder="Search by Company or Role"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={() => setAddJob(true)}>
          Add Job
        </Button>
      </Box>

      <AddJob open={addJob} onClose={handleCloseModal} currentUser={currentUser} />
      <JobDetail open={openDetail} onClose={handleCloseModal} currentUser={currentUser} job={selectedJob} />

      {/* Job Categories */}
      {['active', 'applied', 'ghosted', 'rejected'].map(category => (
        <Accordion
        //key={category}
        //expanded={expanded === category}
        //onChange={handleAccordionChange(category)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${category}-content`}
          id={`${category}-header`}
        >
          <Typography variant="h6">
        {category.charAt(0).toUpperCase() + category.slice(1)} Jobs (
        {filteredJobs[category].length})
      </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Date Applied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs[category].length > 0 ? (
                  filteredJobs[category].map((job, index) => (
                    <TableRow
                      key={index}
                      onClick={(e) => {
                        if (e.target.tagName !== 'BUTTON') {
                          setSelectedJob(job);
                          setOpenDetail(true);
                        }
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#b9732f",
                        },
                        fontSize: "0.5rem"
                      }}
                    >
                      <TableCell
                      sx={{
                        padding: "0px 8px", // Reduce padding
                      }}
                      >
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusClick(e, job);
                          }}
                          variant="text"
                          sx={{
                            justifyContent: "flex-start",
                            padding: "0px 0px",
                            textAlign: "left",
                            minWidth: 0,
                            color: statusColors[job.status],
                          }}
                        >
                          {job.status}
                        </Button>
                      </TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.role}</TableCell>
                      <TableCell>${job.salary}</TableCell>
                      <TableCell>{job.dateApplied}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No jobs found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    ))}

      {/* Status Dropdown */}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => setStatusAnchorEl(null)}
      >
        {['Applied', 'HR Interview', 'Hiring Manager Interview', 'Peer Interviews','Rejected', 'Offer'].map(status => (
          <MenuItem key={status} onClick={() => handleStatusChange(status)}>
            {status}
          </MenuItem>
        ))}
      </Menu>
    </Box>

    <Box mt={4}>
  <Typography variant="h6" gutterBottom>
    Job Application Summary
  </Typography>
    <SankeyChart jobs={jobs} statusColors={statusColors} />


</Box>


    </ThemeProvider>
  );
}
