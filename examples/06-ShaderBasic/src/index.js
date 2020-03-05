import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import sphereData from './sphere';

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

const { positions, normals, indices } = sphereData;
const centers = new Float32Array(positions.length);

let p0, p1, p2, cx, cy, cz, cxyz;
for (let i = 0; i < positions.length; i += 9) {
  p0 = [positions[i + 0], positions[i + 1], positions[i + 2]];
  p1 = [positions[i + 3], positions[i + 4], positions[i + 5]];
  p2 = [positions[i + 6], positions[i + 7], positions[i + 8]];

  cx = (p0[0] + p1[0] + p2[0]) / 3;
  cy = (p0[1] + p1[1] + p2[1]) / 3;
  cz = (p0[2] + p1[2] + p2[2]) / 3;

  cxyz = [cx, cy, cz];

  centers.set(cxyz, i + 0);
  centers.set(cxyz, i + 3);
  centers.set(cxyz, i + 6);
}

const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addAttribute('aNormal', normals, 3)
  .addAttribute('aCenter', centers, 3)
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
  time: 0,
  view,
  proj
};

const vsNoise = require('./shaders/noise.vert')();
const fs = require('./shaders/basic.frag')();

const shader = new PIXI.Shader.from(vsNoise, fs, uniforms);
const mesh = new PIXI.Mesh(geometry, shader);
mesh.state.depthTest = true;

app.stage.addChild(mesh);


// **********************************
//	render loop callback
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  uniforms.time += delta * 0.002;
  cameraControl.update();
}