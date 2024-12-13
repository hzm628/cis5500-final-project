import React, { useState } from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto"; // Ensures Chart.js is properly imported
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import config from "../config.json"; // Import configuration

const RadarCard = styled(Paper)({
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

const normalizeData = (data, maxValues) => {
  return data.map((value, index) => {
    return maxValues[index] ? value / maxValues[index] : 0;
  });
};

const ComparisonsPage = () => {
  const [city1, setCity1] = useState("");
  const [country1, setCountry1] = useState("");
  const [city2, setCity2] = useState("");
  const [country2, setCountry2] = useState("");
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Fetch data from API using the full URL from config
      const query = `http://${config.server_host}:${config.server_port}/compare_cities?city1=${encodeURIComponent(city1)}&country1=${encodeURIComponent(country1)}&city2=${encodeURIComponent(city2)}&country2=${encodeURIComponent(country2)}`;
      console.log("Querying:", query); // Debugging
      const response = await fetch(query);

      if (!response.ok) {
        throw new Error("Failed to fetch comparison data. Please try again.");
      }

      const data = await response.json();
      console.log("Response data:", data); // Debugging
      setComparisonData(data);
    } catch (err) {
      console.error("Error fetching comparison data:", err.message);
      setError(err.message);
      setComparisonData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const allCategories = ["population", "cost_of_living", "terrorism_attacks", "crime_index", "average_temperature"];
  const maxValues = [25000000, 100, 50, 300, 100]; // Example max values for normalization

  const radarData = comparisonData
    ? {
        labels: allCategories, // Use explicit category labels
        datasets: [
          {
            label: `${city1}, ${country1}`,
            data: normalizeData(
              allCategories.map((category) => {
                const item = comparisonData.find((data) => data.category === category);
                return item
                  ? item[`${city1.toLowerCase().replace(/ /g, "_")}_${country1.toLowerCase().replace(/ /g, "_")}`] || 0
                  : 0;
              }),
              maxValues
            ),
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
          {
            label: `${city2}, ${country2}`,
            data: normalizeData(
              allCategories.map((category) => {
                const item = comparisonData.find((data) => data.category === category);
                return item
                  ? item[`${city2.toLowerCase().replace(/ /g, "_")}_${country2.toLowerCase().replace(/ /g, "_")}`] || 0
                  : 0;
              }),
              maxValues
            ),
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        City Comparisons
      </Typography>
      <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
        Compare two cities across various features and visualize the results.
      </Typography>

      <Box sx={{ mb: 5, display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Enter City 1"
          variant="outlined"
          value={city1}
          onChange={(e) => setCity1(e.target.value)}
          sx={{ width: "30%" }}
        />
        <TextField
          label="Enter Country 1"
          variant="outlined"
          value={country1}
          onChange={(e) => setCountry1(e.target.value)}
          sx={{ width: "30%" }}
        />
        <TextField
          label="Enter City 2"
          variant="outlined"
          value={city2}
          onChange={(e) => setCity2(e.target.value)}
          sx={{ width: "30%" }}
        />
        <TextField
          label="Enter Country 2"
          variant="outlined"
          value={country2}
          onChange={(e) => setCountry2(e.target.value)}
          sx={{ width: "30%" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Compare"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" textAlign="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      {comparisonData && (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <RadarCard>
              <Typography variant="h6" gutterBottom>
                Comparison Results
              </Typography>
              <ul style={{ textAlign: "left" }}>
                {allCategories.map((category, index) => {
                  const item = comparisonData.find((data) => data.category === category);
                  return (
                    <li key={index}>
                      {`${category}: ${
                        item
                          ? item[`${city1.toLowerCase().replace(/ /g, "_")}_${country1.toLowerCase().replace(/ /g, "_")}`] ?? "No Data"
                          : "No Data"
                      } vs ${
                        item
                          ? item[`${city2.toLowerCase().replace(/ /g, "_")}_${country2.toLowerCase().replace(/ /g, "_")}`] ?? "No Data"
                          : "No Data"
                      }`}
                    </li>
                  );
                })}
              </ul>
            </RadarCard>
          </Grid>

          <Grid item xs={12} md={6}>
            {radarData && (
              <RadarCard>
                <Typography variant="h6" gutterBottom>
                  Radar Graph
                </Typography>
                <Radar data={radarData} />
              </RadarCard>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ComparisonsPage;
