import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Slider,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import CityCard from '../components/CityCard';
import config from '../config.json';

export default function SearchCitiesPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [city, setCity] = useState('');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [minSummerTemp, setMinSummerTemp] = useState([-999, 999]);
  const [minWinterTemp, setMinWinterTemp] = useState([-999, 999]);
  const [minPopulation, setMinPopulation] = useState('');
  const [maxPopulation, setMaxPopulation] = useState('');
  const [crimeIndex, setCrimeIndex] = useState([0, 400]);
  const [safetyIndex, setSafetyIndex] = useState([0, 100]);
  const [costOfLivingIndex, setCostOfLivingIndex] = useState([0, 100]);
  const [terrorismDeaths, setTerrorismDeaths] = useState([0, 9999]);
  const [includeCitiesWithNoData, setIncludeCitiesWithNoData] = useState(true);  

  const fetchCities = () => { 
    setLoading(true);
    const queryParams = [
      country !== '' ? `country=${encodeURIComponent(country)}` : '',
      `min_summer_temp=${minSummerTemp[0]}`,
      `max_summer_temp=${minSummerTemp[1]}`,
      `min_winter_temp=${minWinterTemp[0]}`,
      `max_winter_temp=${minWinterTemp[1]}`,
      minPopulation !== '' ? `min_population=${Number(minPopulation)}` : '', 
      maxPopulation !== '' ? `max_population=${Number(maxPopulation)}` : '',
      `max_crime_index=${crimeIndex[1]}`,
      `min_safety_index=${safetyIndex[0]}`,
      `max_cost_of_living_index=${costOfLivingIndex[1]}`,
      `max_terrorism_deaths=${terrorismDeaths[1]}`,
      includeCitiesWithNoData ? 'include_missing_data=true' : '',
    ] 
      .filter(Boolean) // filter out empty strings 
      .join('&'); // format query parameters 

    const query = `http://${config.server_host}:${config.server_port}/preference_search?${queryParams}`;

    fetch(query)
      .then((res) => res.json())
      .then((resJson) => {
        setData(resJson);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cities:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    const filtered = data.filter((cityObj) =>
      city === '' ? true : cityObj.city.toLowerCase().includes(city.toLowerCase())
    );
    setFilteredData(filtered);
  }, [city, data]);

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Search Cities by Preferences
      </Typography>
      <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
        Use the filters below to search for cities based on your preferences, such as climate, population, safety, cost of living, and more. Start exploring the cities that match your ideal criteria!
      </Typography>

      {/* Filters */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* City Field */}
        <Grid item xs={12}>
          <TextField
            label="City"
            fullWidth
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Grid>

        {/* Country Field */}
        <Grid item xs={12}>
          <TextField
            label="Country"
            fullWidth
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </Grid>

        {/* Population Filters */}
        <Grid item xs={12} container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Min Population"
              type="text"
              value={minPopulation}
              onChange={(e) => setMinPopulation(e.target.value)}
              fullWidth
              placeholder="e.g., 100000"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max Population"
              type="text"
              value={maxPopulation}
              onChange={(e) => setMaxPopulation(e.target.value)}
              fullWidth
              placeholder="e.g., 10000000"
            />
          </Grid>
        </Grid>

        {/* Temperature Filters */}
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Average Summer Temperature (°F)</Typography>
          <Slider
            value={minSummerTemp}
            onChange={(e, newValue) => setMinSummerTemp(newValue)}
            valueLabelDisplay="auto"
            min={-40}
            max={120}
          /> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Average Winter Temperature (°F)</Typography>
          <Slider
            value={minWinterTemp} 
            onChange={(e, newValue) => setMinWinterTemp(newValue)}
            valueLabelDisplay="auto"
            min={-40}
            max={120}
          />
        </Grid>

        {/* Safety and Crime Index Filters */}
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Crime Index</Typography>
          <Slider
            value={crimeIndex}
            onChange={(e, newValue) => setCrimeIndex(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={400}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Safety Index</Typography>
          <Slider
            value={safetyIndex}
            onChange={(e, newValue) => setSafetyIndex(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
        </Grid>

        {/* Cost of Living */}
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Cost of Living Index</Typography>
          <Slider
            value={costOfLivingIndex}
            onChange={(e, newValue) => setCostOfLivingIndex(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
          />
        </Grid>

        {/* Maximum Terrorism Deaths */}
        <Grid item xs={12} sm={6}>
          <Typography gutterBottom>Maximum Terrorism Deaths</Typography>
          <Slider
            value={terrorismDeaths}
            onChange={(e, newValue) => setTerrorismDeaths(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
          />
        </Grid>

        {/* Checkbox */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCitiesWithNoData}
                onChange={(e) => setIncludeCitiesWithNoData(e.target.checked)}
              />
            }
            label="Include cities with missing data"
          />
        </Grid>

      </Grid>

      <Button variant="contained" color="primary" onClick={fetchCities}>
        Search
      </Button>

      {/* City Results */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {loading ? (
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          filteredData.map((city, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CityCard city={city} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

