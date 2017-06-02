import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import objLoader from './loaders/objLoader';
import objParser from './loaders/objParser';

//	initialize pixi
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
document.body.appendChild(renderer.view);

window.renderer = renderer

//	events
document.body.addEventListener('resize', resize);

//	stage
const stage = new PIXI.Stage();

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 25);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


//	texture
const texture = PIXI.Texture.from('./assets/ao-car.jpg');

const uniforms = {
	texture,
	view,
	proj,
	time:0
}



const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

//	shader
const shader = new PIXI.Shader.from(vs, fs, uniforms);

//	geometry
const loader = new PIXI.loaders.Loader();
// console.log('Loader :', loader);
loader.use(objLoader())
loader.add(['./assets/car.obj']);
loader.load(()=>{
	console.log('Loaded');
	const geometry = PIXI.mesh.Geometry.from('./assets/car.obj');

	//	mesh
	const mesh = new PIXI.mesh.RawMesh(geometry, shader);
	mesh.state.depthTest = true;

	console.table(geometry.attributes);
	console.log(geometry);

	stage.addChild(mesh);

	loop();
});


function loop() {
	shader.uniforms.time += 0.005;
	requestAnimationFrame(loop);

	cameraControl.update();

	renderer.render(stage);
}

function resize() {

}