// server.js

const budo = require('budo')
const babelify = require('babelify')

budo('./index.js', {
  live: true,             // live reload
  stream: process.stdout, // log to stdout
  port: 9966,             // use this as the base port
  dir: 'dev',
  browserify: {
    transform: babelify   // use ES6
  }
}).on('connect', function(ev) {
  //...
  console.log('Server UP');
})