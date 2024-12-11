import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

const config = require('../config.json');

function CountryDetailsDialog({ countryName, open, onClose }) {
  const [countryDetails, setCountryDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (countryName) {
      setIsLoading(true);
      fetch(`http://${config.server_host}:${config.server_port}/country?country_name=${encodeURIComponent(countryName)}`)
        .then((res) => res.json())
        .then((data) => {
          setCountryDetails(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching country details:', err);
          setIsLoading(false);
        });
    }
  }, [countryName]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {countryDetails?.country_name || 'Unknown Country'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Population:</strong> {countryDetails?.population?.toLocaleString() || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Largest City:</strong> {countryDetails?.largest_city || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Land Area:</strong> {countryDetails?.land_area !== -1 ? `${countryDetails?.land_area.toLocaleString()} km²` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>GDP:</strong> {countryDetails?.gdp !== -1 ? `$${countryDetails?.gdp.toLocaleString()} USD` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Life Expectancy:</strong> {countryDetails?.life_expectancy !== -1 ? `${countryDetails?.life_expectancy} years` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Official Language:</strong> {countryDetails?.official_language || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Healthcare Costs:</strong> {countryDetails?.healthcare_costs !== -1 ? `$${countryDetails?.healthcare_costs.toLocaleString()} USD` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Democracy Index:</strong> {countryDetails?.democracy_index !== -1 ? countryDetails?.democracy_index : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Tax Rate:</strong> {countryDetails?.tax_rate !== -1 ? `${countryDetails?.tax_rate}%` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Unemployment Rate:</strong> {countryDetails?.unemployment_rate !== -1 ? `${countryDetails?.unemployment_rate}%` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Education Index:</strong> {countryDetails?.education_index !== -1 ? countryDetails?.education_index : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Birth Rate:</strong> {countryDetails?.birth_rate !== -1 ? `${countryDetails?.birth_rate} per 1,000` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Fertility Rate:</strong> {countryDetails?.fertility_rate !== -1 ? `${countryDetails?.fertility_rate} children per woman` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Infant Mortality:</strong> {countryDetails?.infant_mortality !== -1 ? `${countryDetails?.infant_mortality} per 1,000 live births` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Agricultural Land:</strong> {countryDetails?.agricultural_land !== -1 ? `${countryDetails?.agricultural_land}%` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Forested Area:</strong> {countryDetails?.forested_area !== -1 ? `${countryDetails?.forested_area}%` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Gasoline Price:</strong> {countryDetails?.gasoline_price !== -1 ? `$${countryDetails?.gasoline_price} USD per liter` : 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Physicians per Capita:</strong> {countryDetails?.physicians_per_capita !== -1 ? `${countryDetails?.physicians_per_capita} per 1,000` : 'N/A'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default CountryDetailsDialog;