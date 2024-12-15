import React, { useState, useEffect } from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/system";
import config from "../config.json";
import { useLocation } from "react-router-dom";

const RadarCard = styled(Paper)({
  borderRadius: "15px",
  padding: "1.5rem",
  textAlign: "center",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
  },
});

const normalizeData = (data, maxValues) => {
  return data.map((value, index) => {
    return maxValues[index] ? value / maxValues[index] : 0;
  });
};

// Fixed benchmark max values for normalization
const fixedMaxValues = [
  25000000, // population
  100,      // cost_of_living
  50,       // terrorism_attacks
  300,      // crime_index
  120,      // average_temperature
];

const ComparisonsPage = () => {
  const location = useLocation(); 
  const prefilledCity1 = location.state?.city1 || "";
  const prefilledCountry1 = location.state?.country1 || "";

  // Input states (change on typing)
  const [inputCity1, setInputCity1] = useState(prefilledCity1);
  const [inputCountry1, setInputCountry1] = useState(prefilledCountry1);
  const [inputCity2, setInputCity2] = useState("");
  const [inputCountry2, setInputCountry2] = useState("");

  // Compared states (only update on Compare click)
  const [comparedCity1, setComparedCity1] = useState(prefilledCity1);
  const [comparedCountry1, setComparedCountry1] = useState(prefilledCountry1);
  const [comparedCity2, setComparedCity2] = useState("");
  const [comparedCountry2, setComparedCountry2] = useState("");

  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Automatically trigger comparison if prefilled data is present
    if (prefilledCity1 && prefilledCountry1) {
      handleCompare();
    }
  }, [prefilledCity1, prefilledCountry1]);

  const handleCompare = async () => {
    try {
      // Update compared states to "freeze" input
      setComparedCity1(inputCity1);
      setComparedCountry1(inputCountry1);
      setComparedCity2(inputCity2);
      setComparedCountry2(inputCountry2);

      setError(null);
      setComparisonData(null);
      setIsLoading(true);

      const query = `http://${config.server_host}:${config.server_port}/compare_cities?city1=${encodeURIComponent(inputCity1)}&country1=${encodeURIComponent(inputCountry1)}&city2=${encodeURIComponent(inputCity2)}&country2=${encodeURIComponent(inputCountry2)}`;
      console.log("Querying:", query);
      const response = await fetch(query);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch comparison data. Please try again.");
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error("One or both cities do not exist. Please fix spelling and try again.");
      }

      console.log("Response data:", data);
      setComparisonData(data);
    } catch (err) {
      console.error("Error fetching comparison data:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const allCategories = ["population", "cost_of_living", "terrorism_attacks", "crime_index", "average_temperature"];

  const radarData = comparisonData
    ? {
        labels: allCategories,
        datasets: [
          {
            label: `${comparedCity1}, ${comparedCountry1}`,
            data: normalizeData(
              allCategories.map((category) => {
                const item = comparisonData.find((data) => data.category === category);
                return item
                  ? item[`${comparedCity1.toLowerCase().replace(/ /g, "_")}_${comparedCountry1.toLowerCase().replace(/ /g, "_")}`] || 0
                  : 0;
              }),
              fixedMaxValues
            ),
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
          {
            label: `${comparedCity2}, ${comparedCountry2}`,
            data: normalizeData(
              allCategories.map((category) => {
                const item = comparisonData.find((data) => data.category === category);
                return item
                  ? item[`${comparedCity2.toLowerCase().replace(/ /g, "_")}_${comparedCountry2.toLowerCase().replace(/ /g, "_")}`] || 0
                  : 0;
              }),
              fixedMaxValues
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

      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Enter City 1"
            variant="outlined"
            value={inputCity1}
            onChange={(e) => setInputCity1(e.target.value)}
            sx={{ width: "30%" }}
          />
          <TextField
            label="Enter Country 1"
            variant="outlined"
            value={inputCountry1}
            onChange={(e) => setInputCountry1(e.target.value)}
            sx={{ width: "30%" }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 2 }}>
          <TextField
            label="Enter City 2"
            variant="outlined"
            value={inputCity2}
            onChange={(e) => setInputCity2(e.target.value)}
            sx={{ width: "30%" }}
          />
          <TextField
            label="Enter Country 2"
            variant="outlined"
            value={inputCountry2}
            onChange={(e) => setInputCountry2(e.target.value)}
            sx={{ width: "30%" }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompare}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Compare"}
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" textAlign="center" sx={{ mb: 4 }}>
          {error}
        </Typography>
      )}

      {comparisonData && !error && (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <RadarCard>
              <Typography variant="h6" gutterBottom>
                Comparison Results
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>{comparedCity1}, {comparedCountry1}</TableCell>
                      <TableCell>{comparedCity2}, {comparedCountry2}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allCategories.map((category, index) => {
                      const item = comparisonData.find((data) => data.category === category);
                      return (
                        <TableRow key={index}>
                          <TableCell>{category}</TableCell>
                          <TableCell>
                            {item
                              ? item[`${comparedCity1.toLowerCase().replace(/ /g, "_")}_${comparedCountry1.toLowerCase().replace(/ /g, "_")}`] ?? "No Data"
                              : "No Data"}
                          </TableCell>
                          <TableCell>
                            {item
                              ? item[`${comparedCity2.toLowerCase().replace(/ /g, "_")}_${comparedCountry2.toLowerCase().replace(/ /g, "_")}`] ?? "No Data"
                              : "No Data"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
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
