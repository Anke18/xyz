module.exports = fastify => {
  require('./root')(fastify);
  require('./proxy')(fastify);
  require('./api/_api')(fastify);
  require('./auth/_auth')(fastify);
  require('./workspace/_workspace')(fastify);
};