const env = require('../mod/env');

const jsr = require('jsrender');

const fetch = require('node-fetch');

module.exports = {route, view};

const multer = require('fastify-multer'); // or import multer from 'fastify-multer'

//==================
const storage = multer.diskStorage({
  destination: './public/img/userphotoes/',
  filename: function (req, file, cb) {        
      // null as first argument means no error
      cb(null, Date.now() + '-' + file.originalname )
  }
})

const upload = multer({ storage: storage });
//==================

function route(fastify) {

  fastify.register(multer.contentParser);

  fastify.route({
    method: 'GET',
    url: '/form',
    preValidation: fastify.auth([
      (req, res, next) => fastify.authToken(req, res, next, {
        public: true
      })
    ]),
    handler: view
  });

  fastify.route({
    method: 'POST',
    url: storage,
    preHandler: upload.single('avatar'),
    handler: function(request, reply) {
      alert('测试');
      // request.file is the `avatar` file
      // request.body will hold the text fields, if there were any
      reply.code(200).send('SUCCESS')
    }
  });

  fastify.route({
    method: 'POST',
    url: '/photos/upload',
    preHandler: upload.array('photos', 12),
    handler: function(request, reply) {
      // request.files is array of `photos` files
      // request.body will contain the text fields, if there were any
      reply.code(200).send('SUCCESS')
    }
  });
  
  const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
  fastify.route({
    method: 'POST',
    url: '/cool-profile',
    preHandler: cpUpload,
    handler: function(request, reply) {
      // request.files is an object (String -> Array) where fieldname is the key, and the value is array of files
      //
      // e.g.
      //  request.files['avatar'][0] -> File
      //  request.files['gallery'] -> Array
      //
      // request.body will contain the text fields, if there were any
      reply.code(200).send('SUCCESS')
    }
  });

};

async function view(req, res, token = { access: 'public' }) {

  const _tmpl = await fetch(env.form || `${env.http || 'https'}://${req.headers.host}${env.path}/views/form.html`);

  const tmpl = jsr.templates('tmpl', await _tmpl.text());

  //Build the template with jsrender and send to client.
  res.type('text/html').send(tmpl.render({
    dir: env.path,
    token: req.query.token || token.signed || '""',
  }));

};




