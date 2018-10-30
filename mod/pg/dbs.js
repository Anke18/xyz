// Create DBS connection pools for PostGIS.
module.exports = () => {

  global.pg.dbs = {};
  
  // Iterate through environment variables to find DBS_* entries.
  Object.keys(process.env).forEach(async key => {

    if (key.split('_')[0] === 'DBS') {
    
      // Create connection pool.
      const pool = new require('pg').Pool({
        connectionString: process.env[key]
      });
    
      // Request which accepts q and arr and will return rows or rows.err.
      global.pg.dbs[key.split('_')[1]] = async (q, arr) => {
    
        try {
          const { rows } = await pool.query(q, arr);
          return rows;
    
        } catch (err) {
          Object.keys(err).forEach(key => !err[key] && delete err[key]);
          console.error(err);
          return { err: err };
        }
    
      };

      const PostGIS = await global.pg.dbs[key.split('_')[1]]('SELECT postgis_version();');

      if (PostGIS.err) {
        console.log(`${key}: Can't detect PostGIS.`);
        delete global.pg.dbs[key.split('_')[1]];
      }

      if (PostGIS.length === 1) console.log(`${key}: ${PostGIS[0].postgis_version}`);



    }

  });

};