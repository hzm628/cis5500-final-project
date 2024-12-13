import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber, lightGreen, deepOrange, deepPurple, blueGrey } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import SearchCitiesPage from './pages/SearchCitiesPage';
import ComparisonsPage from './pages/ComparisonsPage';
import SimilaritiesPage from './pages/SimilaritiesPage';

export const theme = createTheme({
  palette: {
    primary: deepPurple,
    secondary: blueGrey,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/search_cities" element={<SearchCitiesPage />} />
          <Route path="/comparisons" element={<ComparisonsPage />} />
          <Route path="/similarities" element={<SimilaritiesPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}