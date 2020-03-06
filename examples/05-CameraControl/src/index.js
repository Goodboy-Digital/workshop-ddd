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
const cameraControl = new OrbitalCameraControl(view, 5);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI / 180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


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

app.stage.addChild(mesh);


// **********************************
//	render loop callback
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  uniforms.time += delta * 0.01;
  cameraControl.update();
}