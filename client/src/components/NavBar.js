import { AppBar, Container, Toolbar, Typography } from '@mui/material';
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
  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3c72, #2a5298)' }}>
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
