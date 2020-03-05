import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';

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
//	geometry
// **********************************

const positions = [20, -20, 20, 20, 20, 20, -20, -20, 20, 20, 20, 20, -20, 20, 20, -20, -20, 20, 20, -20, -20, 20, 20, -20, 20, -20, 20, 20, 20, -20, 20, 20, 20, 20, -20, 20, -20, -20, -20, -20, 20, -20, 20, -20, -20, -20, 20, -20, 20, 20, -20, 20, -20, -20, -20, -20, 20, -20, 20, 20, -20, -20, -20, -20, 20, 20, -20, 20, -20, -20, -20, -20, 20, 20, 20, 20, 20, -20, -20, 20, 20, 20, 20, -20, -20, 20, -20, -20, 20, 20, 20, -20, -20, 20, -20, 20, -20, -20, -20, 20, -20, 20, -20, -20, 20, -20, -20, -20];
const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addIndex(indices);


// **********************************
//	camera
// **********************************

//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 0.1);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI / 180;
let ratio = app.screen.width / app.screen.height;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


// **********************************
//	cube texture
// **********************************

const texture = PIXI.CubeTexture.from([
  'assets/posx.jpg',
  'assets/negx.jpg',
  'assets/posy.jpg',
  'assets/negy.jpg',
  'assets/posz.jpg',
  'assets/negz.jpg'
]);


// **********************************
//	shader and mesh
// **********************************

const uniforms = {
  texture,
  view,
  proj
};

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

const shader = new PIXI.Shader.from(vs, fs, uniforms);
const mesh = new PIXI.Mesh(geometry, shader);
mesh.state.depthTest = true;

app.stage.addChild(mesh);


// **********************************
//	render loop callback
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  cameraControl.update();
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  ratio = app.screen.width / app.screen.height;
  mat4.perspective(proj, 45 * rad, ratio, .1, 100);
}