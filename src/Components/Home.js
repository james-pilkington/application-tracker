import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment, Menu, MenuItem, createTheme, ThemeProvider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useAuth } from '../contexts/authContext';
import { fetchData } from './firebase/Read'; // Assume updateData updates job status in Firebase
import AddJob from './AddJob';
import SearchIcon from '@mui/icons-material/Search';
import { updateData } from './firebase/UpdateWrite';
import JobDetail from './Detail';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Sankey,Tooltip, ResponsiveContainer } from 'recharts';

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
        const result = await fetchData("users/" + currentUser.uid);
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

  
  const generateSankeyData = (jobsObject) => {
    const statusOrder = [
      "Applied",
      "HR Interview",
      "Hiring Manager Interview",
      "Peer Interviews",
      "Offer",
      "Rejected",
    ];
  
    // Extract the jobs array from the object
    const jobs = jobsObject.data;
  
    // Validate that jobs is an array
    if (!Array.isArray(jobs)) {
      console.error("Invalid input: 'jobs' must be an array.");
      return { nodes: [], links: [] };
    }
  
    // Create nodes from statusOrder
    const nodes = statusOrder.map((status) => ({ name: status }));
  
    // Initialize links
    const links = [];
  
    // Iterate over the jobs to create links
    jobs.forEach((job) => {
      const maxStatusIndex = statusOrder.indexOf(job.maxStatus);
      const currentStatusIndex = statusOrder.indexOf(job.status);
  
      // Ensure valid status indices
      if (maxStatusIndex < 0 || currentStatusIndex < 0) return;
  
      // Create transitions from "Applied" to maxStatus
      for (let i = 0; i < maxStatusIndex; i++) {
        const sourceStatus = statusOrder[i];
        const targetStatus = statusOrder[i + 1];
  
        let link = links.find(
          (l) =>
            l.source === i &&
            l.target === i + 1
        );
  
        if (!link) {
          link = { source: i, target: i + 1, value: 0 };
          links.push(link);
        }
  
        link.value += 1;
      }
  
      // If the job was rejected, add a link from maxStatus to "Rejected"
      if (job.status === "Rejected") {
        const rejectedIndex = statusOrder.indexOf("Rejected");
  
        let link = links.find(
          (l) =>
            l.source === maxStatusIndex &&
            l.target === rejectedIndex
        );
  
        if (!link) {
          link = { source: maxStatusIndex, target: rejectedIndex, value: 0 };
          links.push(link);
        }
  
        link.value += 1;
      }
    });
    //console.log(links)
    return { nodes, links };
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
        await updateData(`users/${currentUser.uid}/${selectedJob.id}`, updatedFields);
  
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
                        padding: "4px",
                        fontSize: "0.75rem"
                      }}
                    >
                      <TableCell>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusClick(e, job);
                          }}
                          variant="text"
                          sx={{
                            justifyContent: "flex-start",
                            // padding: "6px 8px",
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
  <ResponsiveContainer width="100%" height={500}>
  <Sankey
    data={generateSankeyData({ data: jobs })}
    node={(node, index) => (
      <g key={`node-${index}`}>
        {/* Render the node rectangle */}
        <rect
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fill="#4caf50"
          stroke="#333"
        />
        {/* Render the label for the node */}
        <text
          fontSize="14"
          x={node.x + node.width + 5} // Position the label outside the node
          y={node.y + node.height / 2}
          dy="0.35em"
          textAnchor="start"
          fill="#000"
        >
          {node.name}
        </text>
      </g>
    )}
    link={{
      curve: "basis", // Smoothens the link paths
      stroke: "#8884d8", // Link color
      strokeWidth: (link) => Math.max(link.value, 2), // Adjust link thickness based on value
      strokeOpacity: 0.7, // Make links slightly transparent
      fill: "none", // Remove fill for cleaner links
    }}
  >
    <Tooltip
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          const { source, target, value } = payload[0];
          return (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '5px',
                borderRadius: '5px',
              }}
            >
              <p>
                <strong>{source.name}</strong> → <strong>{target.name}</strong>
              </p>
              <p>Count: {value}</p>
            </div>
          );
        }
        return null;
      }}
    />
  </Sankey>
</ResponsiveContainer>


</Box>


    </ThemeProvider>
  );
}
