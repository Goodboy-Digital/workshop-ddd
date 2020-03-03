// server.js

const budo = require('budo');
const babelify = require('babelify');
const browserifyShader = require('browserify-shader');
const getNextPort = require('get-next-port');

const babelTransforms = babelify.configure({
  presets: ['@babel/preset-env'],
});

const createServer = (port) => {
  budo('./src/index.js', {
    live: true,             // live reload
    dir:'dist',
    serve:'bundle.js',
    stream: process.stdout, // log to stdout
    port: port,             // use this as the base port
    browserify: {
      transform: [babelTransforms, browserifyShader],
    }
  }).on('connect', function(ev) {
    //...
    console.log(`Server UP at ${port}`);
  })  
};

getNextPort(9966).then(createServer);

