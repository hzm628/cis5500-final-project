import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import CityCard from "../components/CityCard";
import config from "../config.json"; // Import configuration

export default function SimilaritiesPage() {
  const location = useLocation();

  const [cityName, setCityName] = useState(location.state?.cityName || "");
  const [countryName, setCountryName] = useState(location.state?.countryName || "");
  const [similarCities, setSimilarCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Run fetchSimilarCities when location.state changes, 
  // indicating a new city/country was passed.
  useEffect(() => {
    if (location.state?.cityName && location.state?.countryName) {
      setCityName(location.state.cityName);
      setCountryName(location.state.countryName);
      fetchSimilarCities(location.state.cityName, location.state.countryName);
    }
  }, [location.state]);

  // Optionally, if you want to fetch immediately on initial load 
  // if cityName and countryName are available:
  useEffect(() => {
    if (cityName && countryName && similarCities.length === 0) {
      fetchSimilarCities(cityName, countryName);
    }
  }, []);

  const fetchSimilarCities = async (cName = cityName, cCountry = countryName) => {
    try {
      setIsLoading(true);
      setError(null);
      setSimilarCities([]);

      const response = await fetch(
        `http://${config.server_host}:${config.server_port}/similar_cities?city_name=${encodeURIComponent(
          cName
        )}&country_name=${encodeURIComponent(cCountry)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch similar cities.");
      }

      const data = await response.json();
      console.log("Fetched Data:", data);
      setSimilarCities(data);
    } catch (err) {
      console.error("Error fetching similar cities:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Discover Similar Cities
      </Typography>

      <Box sx={{ mb: 5, textAlign: "center" }}>
        <TextField
          label="City Name"
          variant="outlined"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          sx={{ mb: 2, width: "45%" }}
        />
        <TextField
          label="Country Name"
          variant="outlined"
          value={countryName}
          onChange={(e) => setCountryName(e.target.value)}
          sx={{ mb: 2, width: "45%" }}
        />
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fetchSimilarCities(cityName, countryName)}
            disabled={isLoading || !cityName || !countryName}
          >
            {isLoading ? <CircularProgress size={24} /> : "Get Similar Cities"}
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" textAlign="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={4} justifyContent="center">
        {isLoading ? (
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <CircularProgress />
          </Grid>
        ) : similarCities.length > 0 ? (
          similarCities.map((city, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <CityCard
                city={{
                  city: city.city_2,
                  country: city.country_2,
                  city_population: city.city_population,
                  avg_summer_temp: city.avg_summer_temp,
                  avg_winter_temp: city.avg_winter_temp,
                  crime_index: city.crime_index,
                  safety_index: city.safety_index,
                  cost_of_living_index: city.cost_of_living_index,
                  total_deaths_from_terrorism: city.total_terrorism_deaths,
                }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 1, textAlign: "center", fontWeight: "bold" }}
              >
                Similarity Score: {city.similarity_score}%
              </Typography>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            No similar cities found. Please try a different input.
          </Typography>
        )}
      </Grid>
    </Container>
  );
}
