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

const size = 2;

const positions = [
  -size, size, 0,
  size, size, 0,
  size, -size, 0,
  -size, -size, 0
];

const uvs = [
  0, 0,
  1, 0,
  1, 1,
  0, 1
];

const indices = [0, 1, 2, 0, 2, 3];

const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addAttribute('aUV', uvs, 2)
  .addIndex(indices);


// **********************************
//	camera
// **********************************

//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 15);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI / 180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


// **********************************
//	texture
// **********************************

const texture = PIXI.Texture.from('assets/img.jpg');


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