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

const positions = [1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1];
const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35];

const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addIndex(indices);

const size = 3;

const positionSquare = [
  -size, size, 0,
  size, size, 0,
  size, -size, 0,
  -size, -size, 0
];

const uvsSquare = [
  0, 1,
  1, 1,
  1, 0,
  0, 0
];

const indicesSquare = [0, 1, 2, 0, 2, 3];

const geometrySquare = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positionSquare, 3)
  .addAttribute('aUV', uvsSquare, 2)
  .addIndex(indicesSquare);


// **********************************
//	camera
// **********************************

//	1. view matrix
const view = mat4.create();
const viewSquare = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 5);
const cameraControlSquare = new OrbitalCameraControl(viewSquare, 10);

//	2. projection matrix
const proj = mat4.create();
const projSquare = mat4.create();
const rad = Math.PI / 180;
let ratio = app.screen.width / app.screen.height;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);
mat4.perspective(projSquare, 45 * rad, 1, .1, 100);


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
//	render texture and it's FBO
// **********************************

const fboSize = 512;
const renderTexture = PIXI.RenderTexture.create({ width: fboSize, height: fboSize, scaleMode: PIXI.SCALE_MODES.LINEAR });
renderTexture.baseTexture.clearColor = [0.2470, 0.3176, 0.7098, 1];

const fbo = renderTexture.baseTexture.framebuffer;
fbo.addDepthTexture();


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


const uniformsSquare = {
  texture: fbo.colorTexture,
  view: viewSquare,
  proj: projSquare
};

const vsSquare = require('./shaders/square.vert')();
const fsSquare = require('./shaders/square.frag')();

const shaderSquare = new PIXI.Shader.from(vsSquare, fsSquare, uniformsSquare);
const meshSquare = new PIXI.Mesh(geometrySquare, shaderSquare);
meshSquare.state.depthTest = true;

app.stage.addChild(meshSquare);


// **********************************
//	render loop callback
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  // render to framebuffer
  app.renderer.render(mesh, renderTexture);

  // render to screen
  app.renderer.render(app.stage, null);

  cameraControl.update();
  cameraControlSquare.update();
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  ratio = app.screen.width / app.screen.height;
  mat4.perspective(proj, 45 * rad, ratio, .1, 100);
}