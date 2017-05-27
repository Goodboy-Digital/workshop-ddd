// test.js

const findFolder = require('./find-folder-promise');
const PATH_SRC = './src';

findFolder(PATH_SRC, 'shaders').then((mPath)=> {
	console.log('Path Found :', mPath);
},
()=> {
	console.log(`Can't find any directory with the name`);
});