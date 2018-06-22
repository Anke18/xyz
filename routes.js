module.exports = fastify => {

    const auth = require('./auth');

    auth.routes(fastify);

    const appsettings = require('./appsettings');

    appsettings.routes(fastify, auth);

    // Create constructor for mobile detect module.
    const Md = require('mobile-detect');

    // Set jsrender module for server-side templates.
    const jsr = require('jsrender');

    // Set highlight and and markdown-it to turn markdown into flavoured html.
    const hljs = require('highlight.js');
    const markdown = require('markdown-it')({
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }
            return ''; // use external default escaping
        }
    });

    // Universal error handler.
    const errHandler = ourFunc => (...params) => ourFunc(...params).catch(console.error);

    fastify
        .decorate('authLogin', (req, res, done) =>
            auth.chkLogin(req, res, process.env.LOGIN ? true : false, done))
        .after(authLoginRoutes);

    function authLoginRoutes() {

        fastify.route({
            method: 'GET',
            url: global.dir || '/',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {

                await appsettings.getAppSettings(req);

                global.appSettings.hooks = req.query;

                // Check whether request comes from a mobile platform and set template.
                let md = new Md(req.headers['user-agent']);

                let tmpl = req.session && req.session.hooks && req.session.hooks.report ?
                    jsr.templates('./views/report.html') :
                    (md.mobile() === null || md.tablet() !== null) ?
                        jsr.templates('./views/desktop.html') :
                        jsr.templates('./views/mobile.html');

                // Build the template with jsrender and send to client.
                res.type('text/html').send(tmpl.render({
                    title: global.appSettings.title || 'GEOLYTIX | XYZ',
                    bundle_js: 'build/xyz_bundle.js',
                    btnDocumentation: global.appSettings.documentation ? '' : 'style="display: none;"',
                    hrefDocumentation: global.appSettings.documentation ? global.dir + '/' + global.appSettings.documentation : '',
                    btnReport: global.appSettings.report ? '' : 'style="display: none;"',
                    btnLogout: req.session.user ? '' : 'style="display: none;"',
                    btnAdmin: (req.session.user && req.session.user.admin) ? '' : 'style="display: none;"',
                    btnSearch: global.appSettings.gazetteer ? '' : 'style="display: none;"',
                    btnLocate: global.appSettings.locate ? '' : 'style="display: none;"',
                    dir: global.dir,
                    settings: `
                            <script>
                                const host = '${(global.dir || '/').substring(1)}/';
                                const _xyz = ${JSON.stringify(global.appSettings)};
                            </script>`
                }));
            }
        });

        // Read documentation.md into file stream and send render of the github flavoured markdown template to client.
        fastify.route({
            method: 'GET',
            url: global.dir + '/documentation',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('fs').readFile('./public/documentation.md', function (err, md) {
                    if (err) throw err;
                    res
                        .type('text/html')
                        .send(
                            jsr.templates('./views/github.html').render({
                                md: markdown.render(md.toString())
                            }));
                })
            }
        });

        // Proxy for 3rd party services.
        fastify.route({
            method: 'GET',
            url: global.dir + '/proxy/image',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                let uri = req.req.url.substring(req.req.url.indexOf('?')+1);
                uri = uri.split('provider=');
                res.send(require('request')(`${uri[0]}${global.KEYS[uri[1]]}`))
            }
        });

        // Vector layers with PGSQL MVT.
        fastify.route({
            method: 'GET',
            //api/mvt/get/:z/:x/:y
            url: global.dir + '/mvt/:z/:x/:y',
            //beforeHandler: fastify.auth([fastify.authLogin]), !!!not working due to missing cookie in request
            handler: async (req, res) => {
                require('./mod/mvt').fetchTiles(req, res);
            }
        });        

        // Get grid data.
        fastify.route({
            method: 'GET',
            //api/grid/get
            url: global.dir + '/q_grid',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/grid').grid(req, res, fastify)
            }
        });

        // Get geojson data.
        fastify.route({
            method: 'GET',
            //api/geojson/get
            url: global.dir + '/q_geojson',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/geojson').geojson(req, res, fastify)
            }
        });

        // Get cluster layer data.
        // fastify.route({
        //     method: 'GET',
        //     //api/cluster/get
        //     url: global.dir + '/q_cluster',
        //     beforeHandler: fastify.auth([fastify.authLogin]),
        //     handler: async (req, res) => {
        //         require('./mod/cluster').cluster(req, res, fastify)
        //     }
        // });

        // Get id array from cluster layer.
        fastify.route({
            method: 'GET',
            //api/cluster/select
            url: global.dir + '/api/cluster/select',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/cluster').select(req, res, fastify)
            }
        });

        // Get data for selected item.
        fastify.route({
            method: 'POST',
            //api/location/select
            url: global.dir + '/q_select',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/select').select(req, res, fastify)
            }
        });

        // Get chart data for selected item.
        // !!!should be taken from /select infoj
        fastify.route({
            method: 'POST',
            url: global.dir + '/q_chart_data',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/select').chart_data(req, res, fastify)
            }
        });

        // Create a new feature.
        fastify.route({
            method: 'POST',
            //api/location/new
            url: global.dir + '/q_save',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/edit').newRecord(req, res, fastify)
            }
        });

        // Update a feature.
        fastify.route({
            method: 'POST',
            //api/location/update
            url: global.dir + '/q_update',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/edit').updateRecord(req, res, fastify)
            }
        });

        // Delete a feature.
        fastify.route({
            // !!!this should be a get route
            method: 'POST',
            //api/location/delete
            url: global.dir + '/q_delete',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/edit').deleteRecord(req, res, fastify)
            }
        });

        // Get cluster layer data.
        fastify.route({
            method: 'GET',
            //api/location/aggregate
            url: global.dir + '/q_aggregate',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/edit').newAggregate(req, res, fastify)
            }
        });    

        // Get autocomplete records from search term.
        fastify.route({
            method: 'GET',
            //api/gazetteer/autocomplete
            url: global.dir + '/q_gazetteer',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/gazetteer').gazetteer(req, res, fastify)
            }
        });

        // Get place details from Google places.
        fastify.route({
            method: 'GET',
            //api/gazetteer/googleplaces
            url: global.dir + '/q_gazetteer_googleplaces',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/gazetteer').gazetteer_googleplaces(req, res, fastify)
            }
        });

        // Get place details from own data source.
        // fastify.get('/q_gazetteer_places', (req, res) => require('./mod/gazetteer').gazetteer_places(req, res));

        // Calculate catchments from distance matrix.
        fastify.route({
            method: 'GET',
            //api/catchments
            url: global.dir + '/q_catchments',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/catchments').catchments(req, res, fastify)
            }
        });        

        // Get a stored image.
        fastify.route({
            method: 'GET',
            //api/images/get
            url: global.dir + '/q_get_image',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                res.sendFile(process.env.IMAGES + req.query.image.replace(/ /g, '+'))
            }
        });            

        // Post a new image to be stored.
        fastify.route({
            method: 'POST',
            //api/images/new
            url: global.dir + '/q_save_image',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/images').save(req, res, fastify)
            }
        });

        // Remove a stored image.
        fastify.route({
            method: 'GET',
            //api/images/delete
            url: global.dir + '/q_remove_image',
            beforeHandler: fastify.auth([fastify.authLogin]),
            handler: async (req, res) => {
                require('./mod/images').remove(req, res, fastify)
            }
        });

        // Request puppeteer to create a report.
        // fastify.post('/q_report_request', (req, res) => require('./mod/report').request(req, res));

        // Ping whether a report is ready.
        // fastify.get('/q_report_ping', (req, res) => require('./mod/report').ping(req, res));

        // Open a PDF report from local file.
        // fastify.get('/q_pdf_open', (req, res) => res.sendFile(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));

        // Download a PDF report.
        // fastify.get('/q_pdf_download', (req, res) => res.download(require('path').join(__dirname, '/reports/') + req.query.report + '.pdf'));
    }

    fastify
    .decorate('authAPI', (req, res, done) =>
        auth.authAPI(req, res, process.env.LOGIN ? true : false, done))
    .after(authAPIRoutes);

    function authAPIRoutes() {

        fastify.route({
            method: 'GET',
            url: global.dir + '/api/cluster/get',
            beforeHandler: fastify.auth([fastify.authAPI]),
            handler: async (req, res) => {
                require('./mod/cluster').get(req, res, fastify)
            }
        });

    }

}