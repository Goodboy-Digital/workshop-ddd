import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);


// **********************************
//	initialize PixiJS
// **********************************

PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL;

const app = new PIXI.Application({
  view: canvas,
  resizeTo: canvas,
  autoStart: true,
  transparent: true,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
});


// **********************************
//  particle settings
// **********************************

const numParticles = 64 * 2;
const distributionRange = 4;


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
const cameraControl = new OrbitalCameraControl(camera.viewMatrix, 15);


// **********************************
//	init position
// **********************************

const random = (min, max) => min + Math.random() * (max - min);

const posData = new Float32Array(4 * numParticles * numParticles);
const velData = new Float32Array(4 * numParticles * numParticles);
const extraData = new Float32Array(4 * numParticles * numParticles);

for (let i = 0; i < posData.length; i += 4) {
  posData[i + 0] = random(-distributionRange, distributionRange);
  posData[i + 1] = random(-distributionRange, distributionRange);
  posData[i + 2] = random(-distributionRange, distributionRange);
  posData[i + 3] = 1;

  extraData[i + 0] = Math.random();
  extraData[i + 1] = Math.random();
  extraData[i + 2] = Math.random();
  extraData[i + 3] = 1;
}


// **********************************
//	offscreen textures
// **********************************

const renderTextures = [
  PIXI.RenderTexture.create({ width: numParticles, height: numParticles, scaleMode: PIXI.SCALE_MODES.NEAREST }),
  PIXI.RenderTexture.create({ width: numParticles, height: numParticles, scaleMode: PIXI.SCALE_MODES.NEAREST })
];

const fbos = renderTextures.map(texture => texture.baseTexture.framebuffer);

fbos[0]
  .addColorTexture(0, new PIXI.BaseTexture.fromBuffer(posData, numParticles, numParticles))
  .addColorTexture(1, new PIXI.BaseTexture.fromBuffer(velData, numParticles, numParticles))
  .addColorTexture(2, new PIXI.BaseTexture.fromBuffer(extraData, numParticles, numParticles));

fbos[1]
  .addColorTexture(0, new PIXI.BaseTexture.fromBuffer(null, numParticles, numParticles))
  .addColorTexture(1, new PIXI.BaseTexture.fromBuffer(null, numParticles, numParticles))
  .addColorTexture(2, new PIXI.BaseTexture.fromBuffer(null, numParticles, numParticles));
  
fbos[0].colorTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;
fbos[1].colorTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;


// **********************************
//	UVs for particles
// **********************************

const uvParticles = new Float32Array(numParticles * numParticles * 2);

for (let i = 0, count = 0; i < numParticles; i++) {
  const u = (i + 0.5) / numParticles;

  for (let j = 0; j < numParticles; j++) {
    const v = (j + 0.5) / numParticles;
    uvParticles.set([u, v], count * 2);
    count++;
  }
}

const geometryParticles = new PIXI.Geometry()
  .addAttribute('aTextureCoord', uvParticles, 2);


// **********************************
//	particles shader
// **********************************
const vsRender = require('./shaders/render.vert')();
const fsRender = require('./shaders/render.frag')();

const uniformsParticles = {
  texture: fbos[0].colorTextures[0],
  textureExtra: fbos[0].colorTextures[2],
  view: camera.viewMatrix,
  proj: camera.projMatrix,
}

const shaderParticles = PIXI.Shader.from(vsRender, fsRender, uniformsParticles);
const meshParticles = new PIXI.Mesh(geometryParticles, shaderParticles, null, PIXI.DRAW_MODES.POINTS);
meshParticles.state.depthTest = true;


// **********************************
//	offscreen geometry and shader
// **********************************

const geometryQuad = new PIXI.QuadUv();

const vsSim = require('./shaders/sim.vert')();
const fsSim = require('./shaders/sim.frag')();

const uniformsSim = {
  texturePos: fbos[0].colorTextures[0],
  textureVel: fbos[0].colorTextures[1],
  textureExtra: fbos[0].colorTextures[2],
  time: Math.random() * 0xFF
}
const shaderSim = PIXI.Shader.from(vsSim, fsSim, uniformsSim);
const meshSim = new PIXI.Mesh(geometryQuad, shaderSim);


// **********************************
//	render loop callback
// **********************************

app.stage.addChild(meshParticles);
app.ticker.add(renderLoop);

function renderLoop(delta) {
  uniformsSim.time += delta * 0.005;

  //	update particle positions
  uniformsSim.texturePos = fbos[0].colorTextures[0];
  uniformsSim.textureVel = fbos[0].colorTextures[1];
  uniformsSim.textureExtra = fbos[0].colorTextures[2];
  app.renderer.render(meshSim, renderTextures[1]);

  //	render particles
  uniformsParticles.texture = fbos[1].colorTextures[0];
  uniformsParticles.textureExtra = fbos[1].colorTextures[2];
  app.renderer.render(app.stage, null);

  //	ping pong
  renderTextures.reverse();
  fbos.reverse();

  cameraControl.update();
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  camera.aspect = app.screen.width / app.screen.height;
  mat4.perspective(camera.projMatrix, camera.fov, camera.aspect, 0.1, 100);
}