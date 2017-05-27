// shader-watch.js

const fs                = require('fs');
const path              = require('path');
const findFolderPromise = require('./find-folder-promise');
const watcher           = require('./watch');
const copyFile          = require('./copy-file');
const checkExtension    = require('./checkExtension');


const PATH_SRC          = './src';
const TEMPLATE_VERTEX   = './tasks/basic.vert';
const TEMPLATE_FRAGMENT = './tasks/copy.frag';
const regShader         = /shaders\/.+\.(vert|frag)/g;


let shaderPath;
let watcherViews = watcher([PATH_SRC]);

findFolderPromise(PATH_SRC, 'shaders').then( path => {
	shaderPath = path;
	startWatch();
});

function startWatch() {
	watcherViews.on('all',(event, file) => {
		if(file.indexOf('.DS_Store') > -1) return;
		if(!checkExtension(file, ['js'])) return;
		
		if(event !== 'add' && event !== 'change') return;

		getShaderImportsPromise(file).then((shaderImports)=> {
			shaderImports.forEach((mName)=> {
				isShaderExist(mName, (name)=>generateShader(name));
			});
		});
	});
}

function onFile(shaderImports) {
	if(shaderImports.length == 0) { return;	}

	shaderImports.forEach((mName)=> {
		isShaderExist(mName, (name)=>generateShader(name));
	});
}


function generateShader(mName) {
	if(isVertexShader(mName)) {
		generateVertexShader(mName);
	} else {
		generateFragmentShader(mName);
	}
}

const getShaderImportsPromise = (mPath) => new Promise((resolve, reject) => {
	let results = [];

	fs.readFile(mPath, 'utf8', (err, str) => {
		if(err) {
			reject('Error Loading file !');
		} else {
			let match;
			while( match = regShader.exec(str)) {
				results.push(match[0]);
			}

			results = results.map((path)=> {
				return path.replace('shaders/', '');
			});

			resolve(results);
		}
	});
});


function isShaderExist(mShaderName, mCallback) {
	fs.readdir(shaderPath, (err, files) => {
		if(files.indexOf(mShaderName) === -1) {
			mCallback(mShaderName);
		}
	});

	return false;
}

function generateVertexShader(mName) {
	console.log('Generate vertex shader :', mName);
	copyFile(TEMPLATE_VERTEX, path.resolve(shaderPath, mName), (err)=> {
		if(err) console.log('Err', err);
	});
}

function generateFragmentShader(mName) {
	console.log('Generate fragment shader : ', mName);
	copyFile(TEMPLATE_FRAGMENT, path.resolve(shaderPath, mName), (err)=> {
		if(err) console.log('Err', err);
	});
}

function isVertexShader(mName) {
	return mName.indexOf('.vert') > -1;
}
