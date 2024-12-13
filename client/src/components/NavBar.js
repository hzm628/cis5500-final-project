import { AppBar, Container, Toolbar, Typography, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';

function NavText({ href, text, isMain }) {
  return (
    <Typography
      variant={isMain ? 'h6' : 'body1'}
      noWrap
      style={{
        marginRight: '20px',
        fontWeight: isMain ? 700 : 500,
      }}
    >
      <NavLink
        to={href}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        {text}
      </NavLink>
    </Typography>
  );
}

export default function NavBar() {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      sx={{
        background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NavText href="/" text="Relocation Helper" isMain />
          <NavText href="/countries" text="COUNTRIES" />
          <NavText href="/search_cities" text="CITIES" />
          <NavText href="/comparisons" text="COMPARISONS" />
          <NavText href="/similarities" text="SIMILARITIES" />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
