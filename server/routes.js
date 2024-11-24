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


// Route 1: GET /similar_cities
const similar_cities = async function(req, res) {
  const city_name = req.query.city_name ?? '';
  const country_name = req.query.country_name ?? '';

  if (city_name && country_name) {
      connection.query(`
             WITH city_clean AS (
                 SELECT DISTINCT ON (city, country) * FROM cities
                 ORDER BY city, country, city_population DESC
             ), attacks_by_city AS (
                            SELECT city, COUNT(*) AS num_attacks, SUM(nkill) AS num_deaths, SUM(nwound) AS num_injured
                            FROM global_terrorism
                            GROUP BY city
                          ),
                          city_quantiles AS (
                            SELECT
                                a.city, a.country, a.city_population AS population,
                                NTILE(100) OVER (ORDER BY a.city_population) AS city_pop_quantile,
                                NTILE(100) OVER (ORDER BY a.city_latitude) AS latitude_quantile,
                                NTILE(100) OVER (ORDER BY a.city_longitude) AS longitude_quantile,
                                NTILE(100) OVER (ORDER BY b.population) AS country_pop_quantile,
                                NTILE(100) OVER (ORDER BY c.num_attacks) AS terrorism_quantile,
                                NTILE(100) OVER (ORDER BY c.num_deaths) AS terrorism_deaths_quantile,
                                NTILE(100) OVER (ORDER BY c.num_injured) AS terrorism_injured_quantile
                            FROM city_clean a JOIN country b
                            ON (a.country = b.country_name)
                            JOIN attacks_by_city c
                            ON (a.city = c.city)
                            WHERE c.num_attacks > 0
                            AND ((a.city = '${city_name}' AND a.country = '${country_name}')
                            OR (a.city_population > 100000))
                          )
                          SELECT a.city as city_1, a.country as country_1, b.city as city_2, b.country as country_2,
                               ROUND(100 - (ABS(a.city_pop_quantile - b.city_pop_quantile) + ABS(a.latitude_quantile - b.latitude_quantile) +
                                ABS(a.longitude_quantile - b.longitude_quantile) +  ABS(a.country_pop_quantile - b.country_pop_quantile) +
                                ABS(a.terrorism_quantile - b.terrorism_quantile) + ABS(a.terrorism_deaths_quantile - b.terrorism_deaths_quantile) +
                                      ABS(a.terrorism_injured_quantile - b.terrorism_injured_quantile)) / 7.0, 2) AS similarity_score
                          FROM (
                              SELECT * FROM city_quantiles x
                              WHERE x.city = '${city_name}' AND x.country = '${country_name}') a, city_quantiles b
                          WHERE (a.city <> b.city OR a.country <> b.country)
                          ORDER BY similarity_score DESC, a.population + b.population DESC
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
              WITH city_clean AS (
                  SELECT DISTINCT ON (city, country) * FROM cities
                  ORDER BY city, country, city_population DESC
              ), attacks_by_city AS (
                              SELECT city, COUNT(*) AS num_attacks, SUM(nkill) AS num_deaths, SUM(nwound) AS num_injured
                              FROM global_terrorism
                              GROUP BY city
                            ),
                            city_quantiles AS (
                              SELECT
                                  a.city, a.country, a.city_population AS population,
                                  NTILE(100) OVER (ORDER BY a.city_population) AS city_pop_quantile,
                                  NTILE(100) OVER (ORDER BY a.city_latitude) AS latitude_quantile,
                                  NTILE(100) OVER (ORDER BY a.city_longitude) AS longitude_quantile,
                                  NTILE(100) OVER (ORDER BY b.population) AS country_pop_quantile,
                                  NTILE(100) OVER (ORDER BY c.num_attacks) AS terrorism_quantile,
                                  NTILE(100) OVER (ORDER BY c.num_deaths) AS terrorism_deaths_quantile,
                                  NTILE(100) OVER (ORDER BY c.num_injured) AS terrorism_injured_quantile
                              FROM city_clean a JOIN country b
                              ON (a.country = b.country_name)
                              JOIN attacks_by_city c
                              ON (a.city = c.city)
                              WHERE c.num_attacks > 0
                              AND a.city_population >= 1000000
                            )
                            SELECT a.city as city_1, a.country as country_1, b.city as city_2, b.country as country_2,
                                 ROUND(100 - (ABS(a.city_pop_quantile - b.city_pop_quantile) + ABS(a.latitude_quantile - b.latitude_quantile) +
                                  ABS(a.longitude_quantile - b.longitude_quantile) +  ABS(a.country_pop_quantile - b.country_pop_quantile) +
                                  ABS(a.terrorism_quantile - b.terrorism_quantile) + ABS(a.terrorism_deaths_quantile - b.terrorism_deaths_quantile) +
                                        ABS(a.terrorism_injured_quantile - b.terrorism_injured_quantile)) / 7.0, 2) AS similarity_score
                            FROM city_quantiles a, city_quantiles b
                            WHERE (a.city <> b.city OR a.country <> b.country)
                            AND a.city < b.city
                            ORDER BY similarity_score DESC, a.population + b.population DESC
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

// Route 2: GET /compare_cities
const compare_cities = async function(req, res) {
  const city1 = req.query.city1 ?? 'Philadelphia';
  const country1 = req.query.country1 ?? 'United States';
  const city2 = req.query.city2 ?? 'Boston';
  const country2 = req.query.country2 ?? 'United States';

  const col1 = `${city1.replace(/ /g, "_")}_${country1.replace(/ /g, "_")}`;
  const col2 = `${city2.replace(/ /g, "_")}_${country2.replace(/ /g, "_")}`;

  connection.query(`
    WITH city_one AS (
        SELECT * FROM cities
        WHERE (country = '${country1}' AND city = '${city1}')
        ORDER BY city_population DESC
        LIMIT 1
    ),
        city_two AS (
        SELECT * FROM cities
        WHERE (country = '${country2}' AND city = '${city2}')
        ORDER BY city_population DESC
        LIMIT 1
     ),
        populations AS (SELECT 'population'      AS category,
                               a.city_population AS ${col1},
                               b.city_population AS ${col2}
                        FROM city_one a,
                             city_two b
    ),
        cost_of_living AS (SELECT 'cost_of_living'      AS category,
                               a.cost_of_living_index AS ${col1},
                               b.cost_of_living_index AS ${col2}
                        FROM (
                            SELECT * FROM city_one x
                                LEFT JOIN cost_of_living l
                                ON (x.city = l.city AND x.country = l.country)
                             ) a,
                            (
                            SELECT * FROM city_two y
                                LEFT JOIN cost_of_living l
                                ON (y.city = l.city AND y.country = l.country)
                             ) b
    ),
        terrorism_attacks AS (SELECT 'terrorism_attacks'      AS category,
                               a.count AS ${col1},
                               b.count AS ${col2}
                        FROM (
                            SELECT COUNT(*) FROM city_one x
                                LEFT JOIN global_terrorism l
                                ON (x.city = l.city AND x.country = l.country)
                             ) a,
                            (
                            SELECT COUNT(*) FROM city_two y
                                LEFT JOIN global_terrorism l
                                ON (y.city = l.city AND y.country = l.country)
                             ) b
    ),
        crime_index AS (SELECT 'crime_index'      AS category,
                               a.crime_index AS ${col1},
                               b.crime_index AS ${col2}
                        FROM (
                            SELECT * FROM city_one x
                                LEFT JOIN city_crime_index l
                                ON (x.city = l.city AND x.country = TRIM(l.country))
                             ) a,
                            (
                            SELECT * FROM city_two y
                                LEFT JOIN city_crime_index l
                                ON (y.city = l.city AND y.country = TRIM(l.country))
                             ) b
    ),
        avg_temperature AS (SELECT 'average_temperature'      AS category,
                               a.avg AS ${col1},
                               b.avg AS ${col2}
                        FROM (
                            SELECT ROUND(AVG(avg_temperature), 2) AS avg FROM city_one x
                                LEFT JOIN city_temperature l
                                ON (x.city = l.city AND x.country = l.country)
                             ) a,
                            (
                            SELECT ROUND(AVG(avg_temperature), 2) AS avg FROM city_two y
                                LEFT JOIN city_temperature l
                                ON (y.city = l.city AND y.country = l.country)
                             ) b
    )
    SELECT * FROM populations
    UNION ALL
    SELECT * FROM cost_of_living
    UNION ALL
    SELECT * FROM terrorism_attacks
    UNION ALL
    SELECT * FROM crime_index
    UNION ALL
    SELECT * FROM avg_temperature
  `, (err, data) => {
    if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows)
    }
  });
}

// Route 3:  GET /country/:country_name
   const country = async function (req, res) {
    const country_name = req.query.country_name ?? '';
    
    connection.query(`
      SELECT country_name,
             CASE WHEN agricultural_land IS NULL THEN -1 ELSE agricultural_land END AS agricultural_land,
             CASE WHEN land_area IS NULL THEN - 1 ELSE land_area END AS land_area,
             CASE WHEN birth_rate IS NULL THEN -1 ELSE birth_rate END AS birth_rate,
             CASE WHEN co2_emissions IS NULL THEN -1 ELSE co2_emissions END AS co2_emissions,
             CASE WHEN fertility_rate IS NULL THEN -1 ELSE fertility_rate END AS fertility_rate,
             CAS E WHEN forested_area IS NULL THEN -1 ELSE forested_area END AS forested_area,
             CASE WHEN gasoline_price IS NULL THEN -1 ELSE gasoline_price END AS gasoline_price,
             CASE WHEN gdp IS NULL THEN -1 ELSE gdp END AS gdp,
             CASE WHEN infant_mortality IS NULL THEN -1 ELSE infant_mortality END AS infant_mortality,
             CASE WHEN largest_city IS NULL THEN 'N/A' ELSE largest_city END AS largest_city,
             CASE WHEN life_expectancy IS NULL THEN -1 ELSE life_expectancy END AS life_expectancy,
             CASE WHEN minimum_wage IS NULL THEN -1 ELSE minimum_wage END AS minimum_wage,
             CASE WHEN official_language IS NULL THEN 'N/A' ELSE official_language END AS official_language,
             CASE WHEN healthcare_costs IS NULL THEN -1 ELSE healthcare_costs END AS healthcare_costs,
             CASE WHEN physicians_per_capita IS NULL THEN -1 ELSE physicians_per_capita END AS physicians_per_capita,
             CASE WHEN population IS NULL THEN -1 ELSE population END AS population,
             CASE WHEN tax_rate IS NULL THEN -1 ELSE tax_rate END AS tax_rate,
             CASE WHEN unemployment_rate IS NULL THEN -1 ELSE unemployment_rate END AS unemployment_rate,
             CASE WHEN democracy_index IS NULL THEN -1 ELSE democracy_index END AS democracy_index,
             CASE WHEN education_index IS NULL THEN -1 ELSE education_index END AS education_index
      FROM country
      WHERE country = '${country_name}'
      `, (err, data) => {
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

// Route 5: GET /city/:city_name
const city = async function (req, res) {
  const city_name = req.query.city_name ?? '';
  
  connection.query(`
    SELECT cities.country, cities.city, city_population,
       CASE WHEN cost_of_living_index IS NULL THEN -1 ELSE cost_of_living_index END AS cost_of_living_index,
       CASE WHEN rent_index IS NULL THEN -1 ELSE rent_index END AS rent_index,
       CASE WHEN groceries_index IS NULL THEN -1 ELSE groceries_index END AS groceries_index,
       CASE WHEN restaurant_price_index IS NULL THEN -1 ELSE restaurant_price_index END AS restaurant_price_index,
       CASE WHEN ci.crime_index IS NULL THEN -1 ELSE ci.crime_index END AS crime_index,
       CASE WHEN ci.safety_index IS NULL THEN -1 ELSE ci.safety_index END AS safety_index
    FROM cities
    INNER JOIN city_crime_index ci ON ci.city = cities.city
    INNER JOIN cost_of_living ON cost_of_living.city = cities.city
    WHERE city = '${city_name}' AND country != 'United States'
    `, (err, data) => {
     if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
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

// Route 7: GET /city_us/:city_name
const city_us = async function (req, res) {
  const city_name = req.query.city_name ?? '';
  
  connection.query(`
    WITH numSchools AS (
    SELECT city, COUNT(*) AS num_schools
    FROM schools
    GROUP BY city
    )
    SELECT
      cities.country,
      cities.city,
      city_population,
      CASE WHEN cost_of_living_index IS NULL THEN -1 ELSE cost_of_living_index END AS cost_of_living_index,
      CASE WHEN rent_index IS NULL THEN -1 ELSE rent_index END AS rent_index,
      CASE WHEN groceries_index IS NULL THEN -1 ELSE groceries_index END AS groceries_index,
      CASE WHEN restaurant_price_index IS NULL THEN -1 ELSE restaurant_price_index END AS restaurant_price_index,
      CASE WHEN ci.crime_index IS NULL THEN -1 ELSE ci.crime_index END AS crime_index,
      CASE WHEN ci.safety_index IS NULL THEN -1 ELSE ci.safety_index END AS safety_index,
      CASE WHEN violent_crime IS NULL THEN -1 ELSE violent_crime END AS violent_crime,
      CASE WHEN total_crime IS NULL THEN -1 ELSE total_crime END AS total_crime,
      CASE WHEN homeprice IS NULL THEN -1 ELSE homeprice END AS homeprice,
      CASE WHEN n.num_schools IS NULL THEN -1 ELSE n.num_schools END AS num_schools,
      CASE WHEN cdc.percent IS NULL THEN -1 ELSE cdc.percent END AS percent
    FROM cities
    INNER JOIN city_crime_index ci ON ci.city = cities.city
    INNER JOIN cost_of_living ON cost_of_living.city = cities.city
    INNER JOIN zillow_home_prices z ON z.city = cities.city
    INNER JOIN us_crime u ON u.city = cities.city
    INNER JOIN numSchools n ON n.city = cities.city
    INNER JOIN cdc_local_health_data cdc ON cdc.location = cities.city;
    WHERE city = '${city_name}' AND country = 'United States'
    `, (err, data) => {
     if (err) {
      console.log(err);
      res.json({});
    } else {
      res.json(data.rows[0]);
    }
  });
}


// Route 8: GET /preference_search
const preference_search = async function (req, res) {

  const minSummerTemp = req.query.min_summer_temp ?? -999;
  const maxSummerTemp = req.query.max_summer_temp ?? 999;
  const minWinterTemp = req.query.min_winter_temp ?? -999;
  const maxWinterTemp = req.query.max_winter_temp ?? 999;
  const minPopulation = req.query.min_population ?? 0;
  const maxPopulation = req.query.max_population ?? 999999999;
  const maxCrimeIndex = req.query.max_crime_index ?? 999;
  const minSafetyIndex = req.query.min_safety_index ?? 0;
  const maxCostOfLivingIndex = req.query.max_cost_of_living_index ?? 9999;
  const maxTerrorismDeaths = req.query.max_terrorism_deaths ?? 9999;

  if (!page) {
    connection.query(`
      WITH summer_temp AS (
          SELECT 
              city, state, country,
              AVG(avg_temperature) AS avg_summer_temp
          FROM 
              city_temperature
          WHERE 
              month IN (6, 7, 8)
          GROUP BY 
              country, state, city
      ),
      winter_temp AS (
          SELECT 
              city, state, country,
              AVG(avg_temperature) AS avg_winter_temp
          FROM 
              city_temperature
          WHERE 
              month IN (12, 1, 2)
          GROUP BY 
              country, state, city
      ),
      population_data AS (
          SELECT 
              city, country, city_population
          FROM 
              cities
      ),
      crime_data AS (
          SELECT 
              city, country, crime_index, safety_index
          FROM 
              city_crime_index
      ),
      cost_of_living_data AS (
          SELECT 
              city, country, cost_of_living_index
          FROM 
              cost_of_living
      ),
      terrorism_data AS (
          SELECT 
              city, country, SUM(nkill) AS total_deaths_from_terrorism
          FROM 
              global_terrorism
          GROUP BY 
              city, country
      )
      SELECT
          st.city, 
          st.state, 
          st.country, 
          st.avg_summer_temp, 
          wt.avg_winter_temp, 
          pd.city_population, 
          cd.crime_index, 
          cd.safety_index, 
          cld.cost_of_living_index, 
          td.total_deaths_from_terrorism
      FROM 
          summer_temp st
      JOIN 
          winter_temp wt 
          ON st.city = wt.city AND st.country = wt.country AND st.state = wt.state
      JOIN 
          population_data pd 
          ON st.city = pd.city AND st.country = pd.country
      LEFT JOIN 
          crime_data cd 
          ON st.city = cd.city AND st.country = cd.country
      LEFT JOIN 
          cost_of_living_data cld 
          ON st.city = cld.city AND st.country = cld.country
      LEFT JOIN 
          terrorism_data td 
          ON st.city = td.city AND st.country = td.country
      WHERE 
          st.avg_summer_temp BETWEEN ${minSummerTemp} AND ${maxSummerTemp}
          AND wt.avg_winter_temp BETWEEN ${minWinterTemp} AND ${maxWinterTemp}
          AND pd.city_population >= ${minPopulation}
          AND pd.city_population <= ${maxPopulation}
          AND (cd.crime_index IS NULL OR cd.crime_index <= ${maxCrimeIndex})
          AND (cd.safety_index IS NULL OR cd.safety_index >= ${minSafetyIndex})
          AND (cld.cost_of_living_index IS NULL OR cld.cost_of_living_index <= ${maxCostOfLivingIndex})
          AND (td.total_deaths_from_terrorism IS NULL OR td.total_deaths_from_terrorism <= ${maxTerrorismDeaths})
      ORDER BY 
          pd.city_population DESC;
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  } else {
    
    const offset = pageSize * (page - 1);

    connection.query(`
      WITH summer_temp AS (
          SELECT 
              city, state, country,
              AVG(avg_temperature) AS avg_summer_temp
          FROM 
              city_temperature
          WHERE 
              month IN (6, 7, 8)
          GROUP BY 
              country, state, city
      ),
      winter_temp AS (
          SELECT 
              city, state, country,
              AVG(avg_temperature) AS avg_winter_temp
          FROM 
              city_temperature
          WHERE 
              month IN (12, 1, 2)
          GROUP BY 
              country, state, city
      ),
      population_data AS (
          SELECT 
              city, country, city_population
          FROM 
              cities
      ),
      crime_data AS (
          SELECT 
              city, country, crime_index, safety_index
          FROM 
              city_crime_index
      ),
      cost_of_living_data AS (
          SELECT 
              city, country, cost_of_living_index
          FROM 
              cost_of_living
      ),
      terrorism_data AS (
          SELECT 
              city, country, SUM(nkill) AS total_deaths_from_terrorism
          FROM 
              global_terrorism
          GROUP BY 
              city, country
      )
      SELECT
          st.city, 
          st.state, 
          st.country, 
          st.avg_summer_temp, 
          wt.avg_winter_temp, 
          pd.city_population, 
          cd.crime_index, 
          cd.safety_index, 
          cld.cost_of_living_index, 
          td.total_deaths_from_terrorism
      FROM 
          summer_temp st
      JOIN 
          winter_temp wt 
          ON st.city = wt.city AND st.country = wt.country AND st.state = wt.state
      JOIN 
          population_data pd 
          ON st.city = pd.city AND st.country = pd.country
      LEFT JOIN 
          crime_data cd 
          ON st.city = cd.city AND st.country = cd.country
      LEFT JOIN 
          cost_of_living_data cld 
          ON st.city = cld.city AND st.country = cld.country
      LEFT JOIN 
          terrorism_data td 
          ON st.city = td.city AND st.country = td.country
      WHERE 
          st.avg_summer_temp BETWEEN ${minSummerTemp} AND ${maxSummerTemp}
          AND wt.avg_winter_temp BETWEEN ${minWinterTemp} AND ${maxWinterTemp}
          AND pd.city_population >= ${minPopulation}
          AND pd.city_population <= ${maxPopulation}
          AND (cd.crime_index IS NULL OR cd.crime_index <= ${maxCrimeIndex})
          AND (cd.safety_index IS NULL OR cd.safety_index >= ${minSafetyIndex})
          AND (cld.cost_of_living_index IS NULL OR cld.cost_of_living_index <= ${maxCostOfLivingIndex})
          AND (td.total_deaths_from_terrorism IS NULL OR td.total_deaths_from_terrorism <= ${maxTerrorismDeaths})
      ORDER BY 

          pd.city_population DESC 
      LIMIT ${pageSize} OFFSET ${offset};
    `, (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows);
      }
    });
  }
}

// Route 9: GET /largest_cities
const largest_cities = async function (req, res) {
  const country = req.query.country || '';

  connection.query(`
    SELECT city, city_population
    FROM cities
    WHERE country = '${country}'
    ORDER BY city_population DESC
    LIMIT 10;
    `,
    (err, data) => {
      if (err) {
        console.log(err);
        res.json([]);
      } else {
        res.json(data.rows); 
      }
    }
  );
}; 

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
        SBM.cost_of_living_index ASC
      LIMIT ${pageSize} OFFSET ${offset};
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
  similar_cities,
  compare_cities,
  search_cities, 
  search_countries,
  preference_search,
  largest_cities,
  cheapest_cities,
  country,
  city,
  city_us
}
