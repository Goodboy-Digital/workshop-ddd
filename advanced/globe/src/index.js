import * as PIXI from 'pixi.js';
import { mat4, vec3, quat } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import Sphere from './Sphere';

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

const { positions, uvs, indices } = Sphere;
const geometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positions, 3)
  .addAttribute('aTextureCoord', uvs, 2)
  .addIndex(indices);


// **********************************
//	tag position
// **********************************

const tagX = Math.cos(Math.PI / 2) * 10;
const tagZ = Math.sin(Math.PI / 2) * 10 + 2;
const tagPos = vec3.fromValues(tagX, 0, tagZ);


// **********************************
//	texture
// **********************************

const textureEarth = PIXI.Texture.from('./assets/earth.jpg');


// **********************************
//	shader and mesh
//  for earth and dot
// **********************************

// earth
const uniformsEarth = {
  texture: textureEarth,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  uScale: 10,
  uPosition: [0, 0, 0],
  time: 0
}

const vsBasic = require('./shaders/basic.vert')();
const fsEarth = require('./shaders/earth.frag')();

const shaderEarth = PIXI.Shader.from(vsBasic, fsEarth, uniformsEarth);
const meshEarth = new PIXI.Mesh(geometry, shaderEarth);
meshEarth.state.depthTest = true;

// dot
const uniformsDot = {
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  uScale: 0.6,
  color: [0, 0.5, 1],
  uPosition: tagPos,
  opacity: 1
}

const fsDot = require('./shaders/dot.frag')();

const shaderDot = PIXI.Shader.from(vsBasic, fsDot, uniformsDot);
const meshDot = new PIXI.Mesh(geometry, shaderDot);
meshDot.state.depthTest = true;


// **********************************
//	mesh from sprite
// **********************************

const background = new PIXI.Graphics()
  .beginFill(0xFF6600)
  .drawRoundedRect(0, 0, 170, 35, 10);

const text = new PIXI.Text('Hello world!', {
  fontFamily: 'Tahoma, sans-serif',
  fontSize: 24,
  fill: 0xffffff
});
text.x = 25;
text.y = 3;

const container2D = new PIXI.Container();
container2D.addChild(background, text);

const sprite2D = new PIXI.Sprite(app.renderer.generateTexture(container2D));
sprite2D.anchor.set(0.0, 0.5);

const rotateMatrix = mat4.create();

const uniformsPlane = {
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  uScale: 0.03,
  uPosition: tagPos,
  uRotate: rotateMatrix,
}

const vsPlane = require('./shaders/plane.vert')();
const fsPlane = require('./shaders/plane.frag')();

const meshPlane = mesh3DfromSprite(sprite2D, vsPlane, fsPlane, uniformsPlane);


// **********************************
//	helper functions
// **********************************

function mesh3DfromSprite(sprite, vs, fs, uniforms = {}) {
  sprite.calculateVertices();

  const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', sprite.vertexData, 2)
    .addAttribute('aTextureCoord', sprite.uvs, 2)
    .addIndex(sprite.indices);

  uniforms.texture = sprite.texture;
  const shader = PIXI.Shader.from(vs, fs, uniforms);
  const mesh = new PIXI.Mesh(geometry, shader);

  return mesh;
}

// wrap radians to (-PI; PI) range
function wrapRadians(a) {
  const PI2 = Math.PI * 2;
  return a > 0 ?
    (a + Math.PI) % PI2 - Math.PI :
    (a - Math.PI) % PI2 + Math.PI;
}


// **********************************
//	add meshes to the stage
// **********************************

app.stage.addChild(meshEarth, meshPlane, meshDot);


// **********************************
//	render loop callback
// **********************************

app.ticker.add(renderLoop);

function renderLoop(delta) {
  cameraControl.update();
  let { rx, ry, quat } = cameraControl.getRotation();
  mat4.fromQuat(rotateMatrix, quat);

  ry = wrapRadians(ry) / Math.PI * 180;

  if (ry < 115 && ry > -115) {
    meshPlane.state.depthTest = false;
  } else {
    meshPlane.state.depthTest = true;
  }

  shaderEarth.uniforms.time += delta * 0.005;
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  camera.aspect = app.screen.width / app.screen.height;
  mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, 0.1, 100);
}