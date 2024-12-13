import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Paper,
} from '@mui/material';
import { styled } from '@mui/system';
import LazyTable from '../components/LazyTable'; 

const config = require('../config.json');

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
  borderRadius: '15px',
  padding: '3rem',
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
}));

const FeatureCard = styled(Paper)({  
  borderRadius: '20px',
  padding: '2rem',
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  height: '220px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  },
});

export default function HomePage() {
  const author = 'Hena Ansari, Zimo Huang, Alex Keri, Augustin Liu';

  const columns = [
    { headerName: 'City', field: 'city', minWidth: 300 },
    { headerName: 'Country', field: 'country', minWidth: 200 },
    {
      headerName: 'Cost of Living Index',
      field: 'cost_of_living_index',
      minWidth: 150,
      renderCell: (row) => row.cost_of_living_index?.toFixed(2) || 'N/A',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      {/* Welcome Section */}
      <GradientBox>
        <Typography variant="h2" gutterBottom>
          Relocation Helper
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Find your perfect place to live!
        </Typography>
        <Typography variant="body1">
          This website helps you find a new place to live based on your preferences, such as climate, crime rate,
          and cost of living. Explore, compare, and discover the best cities for you!
        </Typography>
      </GradientBox> 

      {/* Features Section */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Explore Our Features
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6} lg={3}>
            <FeatureCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Countries
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Explore all 195 countries in our database and learn about their key details.
              </Typography>
              <Button variant="contained" color="primary" href="/countries">
                Explore
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FeatureCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Cities
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Find cities that match your preferences and explore their unique features.
              </Typography>
              <Button variant="contained" color="primary" href="/search_cities">
                Explore
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FeatureCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Comparisons
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Compare cities side-by-side to find your best match.
              </Typography>
              <Button variant="contained" color="primary" href="/comparisons">
                Explore
              </Button>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <FeatureCard>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Similarities
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Find cities similar to the ones you love.
              </Typography>
              <Button variant="contained" color="primary" href="/similarities">
                Explore
              </Button>
            </FeatureCard>
          </Grid>
        </Grid>
      </Box>

      {/* Teaser: Cheapest Cities */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="body1" textAlign="center" sx={{ mb: 3 }}>
        As a teaser, here's a list of the cheapest cities based on the cost of living, including estimates for cities without available data. Explore the top quartile of affordable cities and find your perfect place to live! 
        Use the pagination below to browse through the results.
        </Typography>
        <LazyTable
          route={`http://${config.server_host}:${config.server_port}/cheapest_cities`}
          columns={columns}
          defaultPageSize={25}
          rowsPerPageOptions={[10, 25]}
        />
      </Box>

      {/* Author Section */}
      <Box sx={{ textAlign: 'center', mt: 5, color: '#555' }}>
        <Typography variant="body2">
          Created by <span style={{ fontWeight: 'bold' }}>{author}</span>
        </Typography>
      </Box>
    </Container>
  );
} 