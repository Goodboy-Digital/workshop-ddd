import * as PIXI from 'pixi.js';
import { mat4 } from 'gl-matrix';
import ObjLoader from './loaders/objLoader';
import VIVEUtils from './VIVEUtils';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);


// **********************************
//	initialize PixiJS
// **********************************

const renderer = new PIXI.Renderer({
  view: canvas,
  width: canvas.clientWidth,
  height: canvas.clientHeight,
  transparent: true,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  clearBeforeRender: false,
});

const stage = new PIXI.Container();
const loader = PIXI.Loader.shared;


// **********************************
//	camera
// **********************************

const camera = {
  viewMatrix: mat4.create(),
  projMatrix: mat4.create(),
};


// **********************************
//	shader
// **********************************

const uniforms = {
  texture: PIXI.Texture.EMPTY,
  view: camera.viewMatrix,
  proj: camera.projMatrix,
};

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();
const shader = new PIXI.Shader.from(vs, fs, uniforms);


// **********************************
//	assets loader 
// **********************************

const objLod = new ObjLoader(PIXI);
loader
  .use(objLod.useHook())
  .add('model', './assets/model.obj')
  .add('aomap', './assets/ao-map.jpg')
  .load(assetsLoaded);


// **********************************
//	loader callback
// **********************************

function assetsLoaded(loader, resources) {
  const texture = resources.aomap.texture;
  shader.uniforms.texture = texture;

  const geometry = resources.model.geometry;
  const mesh = new PIXI.Mesh(geometry, shader);
  mesh.state.depthTest = true;

  stage.addChild(mesh);


  // **********************************
  //	VR init
  // **********************************

  VIVEUtils.init((vrDisplay) => {
    enableVRButton();
    draw(vrDisplay);
  });
}


// **********************************
//	render loop callback
// **********************************

function draw(vrDisplay) {
  vrDisplay.requestAnimationFrame(loop);

  function loop() {
    vrDisplay.requestAnimationFrame(loop);

    const halfScreen = renderer.screen.width / 2;
    // console.log(camera.projMatrix)

    //	get vr data
    VIVEUtils.getFrameData();

    //	render left eye
    VIVEUtils.setCamera(camera.viewMatrix, camera.projMatrix, 'left');
    scissor(renderer, 0, 0, halfScreen, renderer.screen.height);
    renderer.render(stage);

    //	render right eye
    VIVEUtils.setCamera(camera.viewMatrix, camera.projMatrix, 'right');
    scissor(renderer, halfScreen, 0, halfScreen, renderer.screen.height);
    renderer.render(stage);

    //	submit
    VIVEUtils.submitFrame();
  }
}


// **********************************
//	events
// **********************************

window.addEventListener('resize', onResize);

function onResize() {
  renderer.resize(canvas.clientWidth, canvas.clientHeight);
}


function enableVRButton() {
  const btnVR = document.body.querySelector('.vr');
  btnVR.disabled = false;
  btnVR.addEventListener('click', enterVR);

  function enterVR() {
    console.log('enter vr');
    VIVEUtils.present(renderer.gl.canvas, () => {
      console.log('Presented in vr');
    });
  }
}


// **********************************
//	helper functions
// **********************************

function scissor(renderer, x, y, w, h) {
  renderer.gl.scissor(x, y, w, h);
  renderer.gl.viewport(x, y, w, h);
}