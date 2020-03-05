import * as PIXI from 'pixi.js';
import dat from 'dat-gui';
import { mat4, vec3 } from 'gl-matrix';

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

const r = 0.5;
const positions = [
  0, r, 0,
  r, -r, 0,
  -r, -r, 0
];

const colors = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
];

const indices = [0, 1, 2];
const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addAttribute('aColor', colors, 3)
  .addIndex(indices);


// **********************************
//	camera
// **********************************

//	1. view matrix
const view = mat4.create();
const eye = vec3.fromValues(0, 0, 5);
const center = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);
mat4.lookAt(view, eye, center, up);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI / 180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


// **********************************
//	datGUI controls
// **********************************

const gui = new dat.GUI();
const guiOptions = {
  fov: 45,
  x: 0
};

gui.add(guiOptions, 'fov', 10, 180).onChange((newValue) => {
  mat4.perspective(proj, newValue * rad, ratio, .1, 100);
});

gui.add(guiOptions, 'x', -5, 5).onChange((newValue) => {
  vec3.set(eye, newValue, 0, 5);
  mat4.lookAt(view, eye, center, up);
});


// **********************************
//	shader and mesh
// **********************************

const uniforms = {
  color: [1.0, 1.0, 1.0],
  time: 0,
  view,
  proj
};

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

const shader = new PIXI.Shader.from(vs, fs, uniforms);
const mesh = new PIXI.Mesh(geometry, shader);


// **********************************
//	add mesh to the stage
// **********************************

app.stage.addChild(mesh);


// **********************************
//	render loop
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  uniforms.time += delta * 0.01;
}