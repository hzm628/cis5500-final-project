import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

import CityDetailsDialog from './CityDetailsDialog';

const StyledCard = styled(Card)({
  borderRadius: '15px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  },
});

export default function CityCard({ city }) {

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleMoreInfoClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const navigate = useNavigate();

  const handleCompare = () => {
    navigate('/comparisons', {
      state: {
        city1: city.city,
        country1: city.country,
      },
    });
  };

  const handleFindSimilar = () => {
    navigate('/similarities', {
      state: {
        cityName: city.city,
        countryName: city.country,
      },
    });
  };

  return (
    <>
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          {city.city}, {city.country}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Population:</strong>{' '}
          {city.city_population !== undefined && city.city_population !== null
            ? city.city_population
            : 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Average Summer Temperature (°F):</strong>{' '}
          {city.avg_summer_temp !== undefined && city.avg_summer_temp !== null
            ? Number(city.avg_summer_temp).toFixed(2)
            : 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Average Winter Temperature (°F):</strong>{' '}
          {city.avg_winter_temp !== undefined && city.avg_winter_temp !== null
            ? Number(city.avg_winter_temp).toFixed(2)
            : 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Crime Index:</strong>{' '}
          {city.crime_index !== undefined && city.crime_index !== null
            ? city.crime_index
            : 'N/A'} 
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Safety Index:</strong>{' '}
          {city.safety_index !== undefined && city.safety_index !== null
            ? city.safety_index
            : 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Cost of Living Index:</strong>{' '}
          {city.cost_of_living_index !== undefined &&
          city.cost_of_living_index !== null
            ? city.cost_of_living_index
            : 'N/A'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Total Deaths from Terrorism:</strong>{' '}
          {city.total_deaths_from_terrorism !== undefined &&
          city.total_deaths_from_terrorism !== null
            ? city.total_deaths_from_terrorism
            : 'N/A'}
        </Typography> 
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button variant="contained" color="primary" onClick={handleMoreInfoClick}> 
          More Info
        </Button> 
      </Box> 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare} // Navigate to Comparisons Page
        >
          Compare 
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleFindSimilar} // Navigate to Similarities Page
        >
          Find Similar Cities
        </Button>
      </Box>
    </StyledCard>
    {/* CityDetailsDialog */}
    <CityDetailsDialog
      open={dialogOpen}
      cityName={city.city}
      country={city.country}
      onClose={handleDialogClose}
    />
  </>
  );
}
