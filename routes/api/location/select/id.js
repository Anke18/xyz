module.exports = fastify => {
  fastify.route({
    method: 'GET',
    url: '/api/location/select/id',
    beforeHandler: fastify.auth([fastify.authAPI]),
    handler: async (req, res) => {
      
      const token = req.query.token ? fastify.jwt.decode(req.query.token) : { access: 'public' };

      const locale = global.workspace[token.access].config.locales[req.query.locale];

      // Return 406 if locale is not found in workspace.
      if (!locale) return res.code(406).send('Invalid locale.');

      const layer = locale.layers[req.query.layer];

      // Return 406 if locale is not found in workspace.
      if (!layer) return res.code(406).send('Invalid layer.');

      const table = req.query.table;

      // Return 406 if locale is not found in workspace.
      if (!table) return res.code(406).send('Missing table.');

      const id = req.query.id;

      // Return 406 if locale is not found in workspace.
      if (!id) return res.code(406).send('Missing id.');  
      
      const qID = layer.qID;
      
      // Clone the infoj from the memory workspace layer.
      const infoj = JSON.parse(JSON.stringify(layer.infoj));

      // Get a EPSG:4326 geom field which is used to generate geojson for the client map.
      // The geom field is also required for lookup fields.
      const geom = layer.geom ?
        `${table}.${layer.geom}`
        : `(ST_Transform(ST_SetSRID(${table}.${layer.geom_3857}, 3857), 4326))`;


      // Check whether string params are found in the settings to prevent SQL injections.
      if ([table]
        .some(val => (typeof val === 'string' && val.length > 0 && global.workspace[token.access].values.indexOf(val) < 0))) {
        return res.code(406).send('Invalid parameter.');
      }


      // let access_filter = layer.access_filter && token.email && layer.access_filter[token.email.toLowerCase()] ?
      //   layer.access_filter[token.email] : null;


      // The fields array stores all fields to be queried for the location info.
      const fields = await require(global.appRoot + '/mod/pg/sql_fields')([], infoj, locale, geom);

      // Push JSON geometry field into fields array.
      fields.push(`\n   ST_asGeoJson(${geom}) AS geomj`);
        
       
      // let qLog = layer.log_table ?
      //   `( SELECT *, ROW_NUMBER() OVER (
      //       PARTITION BY ${layer.qID || 'id'}
      //       ORDER BY ((${layer.log_table.field || 'log'} -> 'time') :: VARCHAR) :: TIMESTAMP DESC ) AS rank
      //       FROM gb_retailpoint_editable_logs  AS logfilter`
      //   : null;
        
      // q = `
      // SELECT
      //     ${fields}
      //     ${geomj} AS geomj
      // FROM ${layer.log_table ? qLog : table}
      // WHERE 
      // ${layer.log_table ? 'rank = 1 AND ' : ''}
      // ${qID} = $1;`;


      var q =
      `SELECT ${fields.join()}`
      + `\n FROM ${table}`
      + `\n WHERE ${qID} = $1;`;

      var rows = await global.pg.dbs[layer.dbs](q, [id]);

      if (rows.err) return res.code(500).send('Failed to query PostGIS table.');

      // return 204 if no record was returned from database.
      if (rows.length === 0) return res.code(204).send('No rows returned from table.');

      // Iterate through infoj entries and assign values returned from query.
      infoj.forEach(entry =>  {
        if (rows[0][entry.field]) entry.value = rows[0][entry.field];
      });
    
      // Send the infoj object with values back to the client.
      res.code(200).send({
        geomj: rows[0].geomj,
        infoj: infoj
      });

    }
  });
};