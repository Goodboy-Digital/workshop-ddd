import * as PIXI from 'pixi.js';
import { mat4, mat3 } from 'gl-matrix';
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
  far: 10000,
};

mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, camera.near, camera.far);
const cameraControl = new OrbitalCameraControl(camera.viewMatrix, 25);


// **********************************
//	skybox geometry and cube texture
// **********************************

const positionsCube = new Float32Array([40, -40, 40, 40, 40, 40, -40, -40, 40, 40, 40, 40, -40, 40, 40, -40, -40, 40, 40, -40, -40, 40, 40, -40, 40, -40, 40, 40, 40, -40, 40, 40, 40, 40, -40, 40, -40, -40, -40, -40, 40, -40, 40, -40, -40, -40, 40, -40, 40, 40, -40, 40, -40, -40, -40, -40, 40, -40, 40, 40, -40, -40, -40, -40, 40, 40, -40, 40, -40, -40, -40, -40, 40, 40, 40, 40, 40, -40, -40, 40, 40, 40, 40, -40, -40, 40, -40, -40, 40, 40, 40, -40, -40, 40, -40, 40, -40, -40, -40, 40, -40, 40, -40, -40, 40, -40, -40, -40]);
const indicesCube = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);

const skyboxGeometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', positionsCube, 3)
  .addIndex(indicesCube);

const textureCube = PIXI.CubeTexture.from([
  'assets/posx.jpg',
  'assets/negx.jpg',
  'assets/posy.jpg',
  'assets/negy.jpg',
  'assets/posz.jpg',
  'assets/negz.jpg'
]);


// **********************************
//	skybox shader and mesh
// **********************************

const skyBoxUniforms = {
  texture: textureCube,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
}

const vsSky = require('./shaders/skybox.vert')();
const fsSky = require('./shaders/skybox.frag')();
const skyBoxShader = PIXI.Shader.from(vsSky, fsSky, skyBoxUniforms);
const skyBoxMesh = new PIXI.Mesh(skyboxGeometry, skyBoxShader);

app.stage.addChild(skyBoxMesh);


// **********************************
//	car shader
// **********************************

const carUniforms = {
  texture: textureCube,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
  time: 0,
  normalMatrix: mat3.create(),
  vInverseMatrix: mat3.create()
};

const vsCar = require('./shaders/basic.vert')();
const fsCar = require('./shaders/basic.frag')();
const carShader = new PIXI.Shader.from(vsCar, fsCar, carUniforms);


// **********************************
//	assets loader 
// **********************************

const objLod = new ObjLoader(PIXI);
app.loader
  .use(objLod.useHook())
  .add('carGeometry', './assets/car.obj')
  .load(assetsLoaded);


// **********************************
//	loader callback
// **********************************

function assetsLoaded(loader, resources) {
  console.log('Loaded');
  console.table(resources.carGeometry.geometry.attributes);
  console.log('=======================');

  const carGeometry = resources.carGeometry.geometry;

  // **********************************
  //	car mesh
  // **********************************
  const carMesh = new PIXI.Mesh(carGeometry, carShader);
  carMesh.state.depthTest = true;
  carMesh.start = carGeometry.drawCalls[1].start
  carMesh.size = carGeometry.drawCalls[1].size + carGeometry.drawCalls[2].size + carGeometry.drawCalls[3].size

  app.stage.addChild(carMesh);

  app.ticker.add(renderLoop);
}


// **********************************
//	render loop callback
// **********************************

function renderLoop(delta) {
  /// up date matrix..
  // theres no model matrix here!
  mat3.normalFromMat4(carUniforms.normalMatrix, camera.viewMatrix);
  mat3.invert(carUniforms.vInverseMatrix, carUniforms.normalMatrix);
  
  carUniforms.time += delta * 0.105;

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