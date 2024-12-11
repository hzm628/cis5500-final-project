import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';

import { useNavigate } from "react-router"; 

import CountryDetailsDialog from '../components/CountryDetailsDialog';

const config = require('../config.json');

const CountryCard = styled(Paper)({
  borderRadius: '15px',
  padding: '1.5rem',
  textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
  },
});

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Tracks the loading state

  // Fetch countries once 
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/search_countries`)
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
        setIsLoading(false); // Data has been loaded
      })
      .catch((err) => {
        console.error('Error fetching countries:', err);
        setIsLoading(false); // Even if there is an error, stop loading
      });
  }, []);

  const filteredCountries = countries.filter((country) =>
    country.country_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountryClick = (countryName) => {
    setSelectedCountryName(countryName);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCountryName(null);
  };

  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Explore Countries
      </Typography>
      <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
        Browse through all 195 countries and explore cities within them.
      </Typography>

      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <TextField
          label="Search for a country"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '50%' }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress /> {/* Spinner to show loading */}
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredCountries.map((country) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={country.country_name}>
              <CountryCard onClick={() => handleCountryClick(country.country_name)}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {country.country_name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Population: {country.population ? country.population.toLocaleString() : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Coordinates:{' '}
                  {country.latitude && country.longitude
                    ? `${country.latitude.toFixed(2)}, ${country.longitude.toFixed(2)}`
                    : 'N/A'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={() => handleCountryClick(country.country_name)}>
                    More Info
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      navigate(`/search_cities?country=${encodeURIComponent(country.country_name)}`);
                    }} 
                  >
                    Explore Cities
                  </Button>
                </Box> 
              </CountryCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Component */}
      <CountryDetailsDialog
        countryName={selectedCountryName}
        open={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </Container>
  );
} 