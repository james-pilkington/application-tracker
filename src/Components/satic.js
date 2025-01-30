import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const JobSearchArticle = () => {
  return (
    <Paper sx={{ padding: 3, maxWidth: 800, margin: 'auto', marginTop: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            How to Leverage ChatGPT for Your Job Search: 10 Prompts to Improve Your Resume and Find Your Dream Job
          </Typography>
          <Typography variant="body1" paragraph>
            Job hunting can be a lengthy and stressful process, but by using innovative tools like ChatGPT, you can streamline many aspects of your job search. ChatGPT, with its powerful natural language processing (NLP) capabilities, can help create tailored resumes, write compelling cover letters, and even provide valuable insights for preparing for interviews. By using specific prompts, you can ensure your materials stand out to potential employers.
          </Typography>
          <Typography variant="h6" gutterBottom>
            10 ChatGPT Prompts for Job Seekers:
          </Typography>
          <List>
            {[
              "Generate Resume Bullet Points for a Specific Role",
              "Tailor Resume for a Specific Job Description",
              "Create a Tailored Cover Letter",
              "Generate a Professional Summary",
              "Craft an Eye-Catching LinkedIn Headline",
              "Prepare for an Interview",
              "Refine Job Descriptions for Resume",
              "Generate Skills and Keywords for a Resume",
              "Build a Portfolio Section for Your Resume",
              "Create an ATS-Friendly Resume"
            ].map((prompt, index) => (
              <ListItem key={index}>
                <ListItemText primary={prompt} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default JobSearchArticle;
