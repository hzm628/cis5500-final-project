import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import config from '../config.json';

// Utility function to handle `-1` as "N/A"
const formatValue = (value) => (value === -1 || value === '-1' || value === null || value === undefined ? 'N/A' : value);

export default function CityDetailsDialog({ open, cityName, country, onClose }) {
  const [cityDetails, setCityDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open || !cityName) return;

    const fetchCityDetails = async () => {
      setIsLoading(true);
      try {
        const route =
          country === 'United States'
            ? `/city_us?city_name=${encodeURIComponent(cityName)}`
            : `/city?city_name=${encodeURIComponent(cityName)}`;
        const response = await fetch(`http://${config.server_host}:${config.server_port}${route}`);
        const data = await response.json();
        setCityDetails(data);
        console.log('Fetched city details:', data);
      } catch (error) {
        console.error('Error fetching city details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityDetails();
  }, [open, cityName, country]);

  return (

    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {isLoading ? (
        <CircularProgress sx={{ m: 'auto', mt: 5, mb: 5 }} />
      ) : cityDetails ? (
        <>
          <DialogTitle>{formatValue(cityDetails.city)}, {formatValue(cityDetails.country)}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Population:</strong> {formatValue(cityDetails.city_population)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Cost of Living Index:</strong> {formatValue(cityDetails.cost_of_living_index)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Rent Index:</strong> {formatValue(cityDetails.rent_index)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Groceries Index:</strong> {formatValue(cityDetails.groceries_index)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Restaurant Price Index:</strong> {formatValue(cityDetails.restaurant_price_index)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Crime Index:</strong> {formatValue(cityDetails.crime_index)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Safety Index:</strong> {formatValue(cityDetails.safety_index)}
            </Typography>
            {country === 'United States' && ( 
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Violent Crime:</strong> {formatValue(cityDetails.violent_crime)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Total Crime:</strong> {formatValue(cityDetails.total_crime)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Home Price:</strong> {formatValue(cityDetails.homeprice)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Number of Schools:</strong> {formatValue(cityDetails.num_schools)}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>CDC Health Risk Percentage (%):</strong> {formatValue(cityDetails.percent)}
                </Typography>
              </> 
            )} 
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      ) : (
        <Typography variant="body1" sx={{ p: 4 }}>
          No additional data available.
        </Typography>
      )}
    </Dialog>
  );
}
