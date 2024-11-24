const { Pool, types } = require('pg');
const config = require('./config.json')

// Override the default parsing for BIGINT (PostgreSQL type ID 20)
types.setTypeParser(20, val => parseInt(val, 10)); //DO NOT DELETE THIS

// Create PostgreSQL connection using database credentials provided in config.json
// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = new Pool({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
  ssl: {
    rejectUnauthorized: false,
  },
});
connection.connect((err) => err && console.log(err));

/******************
 * WARM UP ROUTES *
 ******************/

// Route 1: GET /author/:type
const author = async function(req, res) {
  // TODO (TASK 1): replace the values of name and pennkey with your own
  const name = 'John Doe';
  const pennkey = 'jdoe';

  // checks the value of type in the request parameters
  // note that parameters are required and are specified in server.js in the endpoint by a colon (e.g. /author/:type)
  if (req.params.type === 'name') {
    // res.json returns data back to the requester via an HTTP response
    res.json({ data: name });
  } else if (null) {
    // TODO (TASK 2): edit the else if condition to check if the request parameter is 'pennkey' and if so, send back a JSON response with the pennkey
  } else {
    res.status(400).json({});
  }
}

// Route 2: GET /random
const random = async function(req, res) {
  // you can use a ternary operator to check the value of request query values
  // which can be particularly useful for setting the default value of queries
  // note if users do not provide a value for the query it will be undefined, which is falsey
  const explicit = req.query.explicit === 'true' ? 1 : 0;

  // Here is a complete example of how to query the database in JavaScript.
  // Only a small change (unrelated to querying) is required for TASK 3 in this route.
  connection.query(`
    SELECT *
    FROM Songs
    WHERE explicit <= ${explicit}
    ORDER BY RANDOM()
    LIMIT 1
  `, (err, data) => {
    if (err) {
      // If there is an error for some reason, print the error message and
      // return an empty object instead
      console.log(err);
      // Be cognizant of the fact we return an empty object {}. For future routes, depending on the
      // return type you may need to return an empty array [] instead.
      res.json({});
    } else {
      // Here, we return results of the query as an object, keeping only relevant data
      // being song_id and title which you will add. In this case, there is only one song
      // so we just directly access the first element of the query results array (data.rows[0])
      // TODO (TASK 3): also return the song title in the response
      res.json({
        song_id: data.rows[0].song_id,
      });
    }
  });
}

/********************************
 * BASIC SONG/ALBUM INFO ROUTES *
 ********************************/

// Route 3: GET /song/:song_id
const song = async function(req, res) {
  // TODO (TASK 4): implement a route that given a song_id, returns all information about the song
  // Hint: unlike route 2, you can directly SELECT * and just return data.rows[0]
  // Most of the code is already written for you, you just need to fill in the query
  connection.query(``, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}

// Route 4: GET /search_countries
const search_countries = async function(req, res) {
  // Return all countries that match the given search query with parameters defaulted to those specified in API spec ordered by name (ascending)
  const country_name = req.query.country_name ?? '';

  if (!country_name) {
    connection.query(`
      SELECT country_name, population, latitude, longitude
      FROM country
      ORDER BY country_name ASC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  } else {
    connection.query(`
      SELECT country_name, population, latitude, longitude
      FROM country
      WHERE (country_name LIKE '%${country_name}%')
      ORDER BY country_name ASC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  }
}

// Route 5: GET /albums
const albums = async function(req, res) {
  // TODO (TASK 6): implement a route that returns all albums ordered by release date (descending)
  // Note that in this case you will need to return multiple albums, so you will need to return an array of objects
  res.json([]); // replace this with your implementation
}

// Route 6: GET /search_cities
const search_cities = async function(req, res) {
  // Return all cities that match the given search query with parameters defaulted to those specified in API spec ordered by name (ascending)
  const city_name = req.query.city_name ?? '';

  if (!city_name) {
    connection.query(`
      SELECT city, country, city_population, city_latitude, city_longitude
      FROM cities
      ORDER BY city ASC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  } else {
    connection.query(`
      SELECT city, country, city_population, city_latitude, city_longitude
      FROM cities
      WHERE (city LIKE '%${city_name}%')
      ORDER BY city ASC
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  }
}

/************************
 * ADVANCED INFO ROUTES *
 ************************/

// Route 7: GET /top_songs
const top_songs = async function(req, res) {
  const page = req.query.page;
  // TODO (TASK 8): use the ternary (or nullish) operator to set the pageSize based on the query or default to 10
  const pageSize = undefined;

  if (!page) {
    // TODO (TASK 9)): query the database and return all songs ordered by number of plays (descending)
    // Hint: you will need to use a JOIN to get the album title as well
    res.json([]); // replace this with your implementation
  } else {
    // TODO (TASK 10): reimplement TASK 9 with pagination
    // Hint: use LIMIT and OFFSET (see https://www.w3schools.com/php/php_mysql_select_limit.asp)
    res.json([]); // replace this with your implementation
  }
}

// Route 8: GET /top_albums
const top_albums = async function(req, res) {
  // TODO (TASK 11): return the top albums ordered by aggregate number of plays of all songs on the album (descending), with optional pagination (as in route 7)
  // Hint: you will need to use a JOIN and aggregation to get the total plays of songs in an album
  res.json([]); // replace this with your implementation
}

// Route 9: GET /search_albums
const search_songs = async function(req, res) {
  // TODO (TASK 12): return all songs that match the given search query with parameters defaulted to those specified in API spec ordered by title (ascending)
  // Some default parameters have been provided for you, but you will need to fill in the rest
  const title = req.query.title ?? '';
  const durationLow = req.query.duration_low ?? 60;
  const durationHigh = req.query.duration_high ?? 660;

  res.json([]); // replace this with your implementation
}

// Route 10: GET /cheapest_cities
const cheapest_cities = async function(req, res) {
  // Returns the top quartile of cheapest cities in order of cost of living, with the cost of living interpolated/estimated for cities without data. Optionally paginated.
  const page = req.query.page;
  const pageSize = req.query.page_size ?? 10;

  if (!page) {
    connection.query(`
      WITH country_avg AS (
        SELECT
            country,
            AVG(cost_of_living_index) AS avg_cost_of_living_index
        FROM
            cost_of_living
        GROUP BY
            country
        ORDER BY avg_cost_of_living_index DESC
      ),
      city_costs AS (
        SELECT
            C.country,
            C.city,
            COALESCE(
                COL.cost_of_living_index,
                CA.avg_cost_of_living_index,
                (SELECT AVG(cost_of_living_index) FROM cost_of_living)
            ) AS cost_of_living_index
        FROM
            cities C
        LEFT JOIN 
            cost_of_living COL ON C.country = COL.country AND C.city = COL.city
        LEFT JOIN 
            country_avg CA ON C.country = CA.country
        ORDER BY cost_of_living_index DESC
      ),
      median_value AS (
        SELECT
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cost_of_living_index) AS median_value
        FROM
            city_costs
      ),
      subset_below_median AS (
        SELECT
            CC.country,
            CC.city,
            CC.cost_of_living_index
        FROM
            city_costs CC
            CROSS JOIN median_value MV
        WHERE
            CC.cost_of_living_index <= MV.median_value
      ),
      median_value_subset AS (
        SELECT
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cost_of_living_index) AS median_value
        FROM
            subset_below_median
      )
      SELECT
        SBM.country,
        SBM.city,
        SBM.cost_of_living_index
      FROM
        subset_below_median SBM
        CROSS JOIN median_value_subset MVS
      WHERE
        SBM.cost_of_living_index <= MVS.median_value
      ORDER BY
        SBM.cost_of_living_index ASC;
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  } else {
    const offset = pageSize * (page - 1)

    connection.query(`
      WITH country_avg AS (
        SELECT
            country,
            AVG(cost_of_living_index) AS avg_cost_of_living_index
        FROM
            cost_of_living
        GROUP BY
            country
        ORDER BY avg_cost_of_living_index DESC
      ),
      city_costs AS (
        SELECT
            C.country,
            C.city,
            COALESCE(
                COL.cost_of_living_index,
                CA.avg_cost_of_living_index,
                (SELECT AVG(cost_of_living_index) FROM cost_of_living)
            ) AS cost_of_living_index
        FROM
            cities C
        LEFT JOIN 
            cost_of_living COL ON C.country = COL.country AND C.city = COL.city
        LEFT JOIN 
            country_avg CA ON C.country = CA.country
        ORDER BY cost_of_living_index DESC
      ),
      median_value AS (
        SELECT
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cost_of_living_index) AS median_value
        FROM
            city_costs
      ),
      subset_below_median AS (
        SELECT
            CC.country,
            CC.city,
            CC.cost_of_living_index
        FROM
            city_costs CC
            CROSS JOIN median_value MV
        WHERE
            CC.cost_of_living_index <= MV.median_value
      ),
      median_value_subset AS (
        SELECT
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cost_of_living_index) AS median_value
        FROM
            subset_below_median
      )
      SELECT
        SBM.country,
        SBM.city,
        SBM.cost_of_living_index
      FROM
        subset_below_median SBM
        CROSS JOIN median_value_subset MVS
      WHERE
        SBM.cost_of_living_index <= MVS.median_value
      ORDER BY
        SBM.cost_of_living_index ASC;
      LIMIT ${pageSize} OFFSET ${offset}
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json({});
      } else {
        res.json(data.rows);
      }
    });
  }
}


module.exports = {
  author,
  random,
  song,
  album,
  albums,
  album_songs,
  top_songs,
  top_albums,
  search_songs,
}
