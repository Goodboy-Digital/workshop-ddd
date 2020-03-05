import * as PIXI from 'pixi.js';

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
  r * 0.67, -r, 0,
  -r * 0.67, -r, 0
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
//	shader and mesh
// **********************************

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

const shader = new PIXI.Shader.from(vs, fs);
const mesh = new PIXI.Mesh(geometry, shader);


// **********************************
//	add mesh to the stage
// **********************************

app.stage.addChild(mesh);


// **********************************
//	render loop
// **********************************

// nothing to do here
// PIXI app will render all meshes on the stage by it self