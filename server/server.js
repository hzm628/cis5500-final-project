const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
  origin: '*',
}));

// We use express to define our various API endpoints and
// provide their handlers that we implemented in routes.js
app.get('/similar_cities', routes.similar_cities);
app.get('/compare_cities', routes.compare_cities);
app.get('/search_cities', routes.search_cities);
app.get('/search_countries', routes.search_countries);
app.get('/preference_search', routes.preference_search);
app.get('/largest_cities', routes.largest_cities);
app.get('/cheapest_cities', routes.cheapest_cities);


app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
