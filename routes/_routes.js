module.exports = fastify => {

  require('./root').route(fastify);

  require('./desktop').route(fastify);

  require('./mobile').route(fastify);

  require('./home').route(fastify);

  require('./guide').route(fastify);

  require('./species').route(fastify);

  require('./species_lwhite').route(fastify);

  require('./form').route(fastify);

  fastify.login.route(fastify);
  
  require('./register')(fastify);

  require('./token').route(fastify);

  require('./proxy_request')(fastify);

  require('./proxy_cdn')(fastify);

  require('./report').route(fastify);

  require('./api/_api')(fastify);

  require('./user/_user')(fastify);

  require('./workspace/_workspace')(fastify);

};