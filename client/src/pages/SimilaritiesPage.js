import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import config from "../config.json"; // Import configuration

const CityCard = styled(Paper)({
  borderRadius: "15px",
  padding: "1.5rem",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  '&:hover': {
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
  },
});

const SimilaritiesPage = () => {
  const [cityName, setCityName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [similarCities, setSimilarCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSimilarCities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSimilarCities([]);

      // Fetch data from API using the full URL from config
      const response = await fetch(`http://${config.server_host}:${config.server_port}/similar_cities?city_name=${encodeURIComponent(cityName)}&country_name=${encodeURIComponent(countryName)}`);

      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse); // Debugging log

      if (!response.ok) {
        const errorData = JSON.parse(rawResponse);
        throw new Error(errorData.error || "Unexpected server error");
      }

      const data = JSON.parse(rawResponse);
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
        <Button
          variant="contained"
          color="primary"
          onClick={fetchSimilarCities}
          disabled={isLoading || !cityName || !countryName}
        >
          {isLoading ? <CircularProgress size={24} /> : "Get Similar Cities"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" textAlign="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={4} justifyContent="center">
        {similarCities.map((city, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CityCard>
              <Typography variant="h6" gutterBottom>
                {city.city_2}, {city.country_2}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Similarity Score: {city.similarity_score} %
              </Typography>
            </CityCard>
          </Grid>
        ))}
      </Grid>

      {isLoading && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  );
};

export default SimilaritiesPage;
