import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import Cube from './Cube';

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
const cameraControl = new OrbitalCameraControl(camera.viewMatrix, 50);


// **********************************
//	geometry
// **********************************

const { positions, uvs, normals, indices } = Cube;

const num = 10;
const gap = 2;
const posOffset = new Float32Array(Math.pow(num, 3) * 3);

for (let i = 0, count = 0; i < num; i++) {
  const x = (-num / 2 + i) * gap + gap * 0.5;
  for (let j = 0; j < num; j++) {
    const y = (-num / 2 + j) * gap + gap * 0.5;
    for (let k = 0; k < num; k++) {
      const z = (-num / 2 + k) * gap + gap * 0.5;
      posOffset.set([x, y, z], count * 3);
      count++;
    }
  }
}

const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addAttribute('aNormal', normals, 3)
  .addAttribute('aPosOffset', posOffset, 3, false, PIXI.TYPES.FLOAT, 0, 0, true) // <- set last argument to TRUE. It's instanced data.
  .addAttribute('aUV', uvs, 2)
  .addIndex(indices);

geometry.instanceCount = Math.pow(num, 3);


// **********************************
//	texture
// **********************************

const texture = PIXI.Texture.from('./assets/gradient.jpg');


// **********************************
//	shader and mesh
// **********************************

const uniforms = {
  texture,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  time: 0
}

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

const shader = new PIXI.Shader.from(vs, fs, uniforms);
const mesh = new PIXI.Mesh(geometry, shader);
mesh.state.depthTest = true;


// **********************************
//	render loop callback
// **********************************

app.stage.addChild(mesh);
app.ticker.add(renderLoop);

function renderLoop(delta) {
  shader.uniforms.time += delta * 0.005;
  cameraControl.update();
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  camera.aspect = app.screen.width / app.screen.height;
  mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, camera.near, camera.far);
}