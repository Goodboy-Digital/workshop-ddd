import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import ObjLoader from './loaders/objLoader';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);


// **********************************
//	initialize PixiJS
// **********************************

const app = new PIXI.Application({
  view: canvas,
  resizeTo: canvas,
  autoStart: true,
  transparent: true,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
});


// **********************************
//	camera
// **********************************

const camera = {
	viewMatrix: mat4.create(),
	projMatrix: mat4.create(),
	fov: 45 * Math.PI / 180,
	aspect: app.screen.width / app.screen.height, // update aspect ratio value when window resized
	near: 0.1,
	far: 100,
};

mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, camera.near, camera.far);
const cameraControl = new OrbitalCameraControl(camera.viewMatrix, 25);


// **********************************
//	shader
//  use empty texture before loading
// **********************************

const uniforms = {
  texture: PIXI.Texture.EMPTY,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  time: 0
};
const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();
const shader = new PIXI.Shader.from(vs, fs, uniforms);


// **********************************
//	assets loader 
// **********************************

const objLod = new ObjLoader(PIXI);
app.loader
  .use(objLod.useHook())
  .add('carGeometry', './assets/car.obj')
  .add('carTexture', './assets/ao-car.jpg')
  .load(assetsLoaded);


// **********************************
//	loader callback
// **********************************

function assetsLoaded(loader, resources) {
  console.log('Loaded');
  console.table(resources.carGeometry.geometry.attributes);
  console.log(resources.carTexture.texture);
	console.log('=======================');

  //  1. set texture to uniform
  shader.uniforms.texture = resources.carTexture.texture;

  //	2. create mesh
  const mesh = new PIXI.Mesh(resources.carGeometry.geometry, shader);
  mesh.state.depthTest = true;

  //  3. add mesh to the stage
  app.stage.addChild(mesh);

  //  4. start render loop
  app.ticker.add(renderLoop);
}


// **********************************
//	render loop callback
// **********************************

function renderLoop() {
  shader.uniforms.time += app.ticker.deltaMS;
  cameraControl.update();
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  camera.aspect = app.screen.width / app.screen.height;
  mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, 0.1, 100);
}