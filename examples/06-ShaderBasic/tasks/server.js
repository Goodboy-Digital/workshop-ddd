// server.js

const budo = require('budo');
const babelify = require('babelify');
const getNextPort = require('get-next-port');

const createServer = (port) => {
	budo('./index.js', {
	  live: true,             // live reload
	  stream: process.stdout, // log to stdout
	  port: port,             // use this as the base port
	  browserify: {
	    transform: babelify   // use ES6
	  }
	}).on('connect', function(ev) {
	  //...
	  console.log(`Server UP at ${port}`);
	})	
};

getNextPort(9966).then(createServer);

