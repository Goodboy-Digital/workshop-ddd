import * as PIXI from 'pixi.js';
import { mat4, vec3, mat3 } from 'gl-matrix';
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
mat4.perspective(proj, 45 * rad, ratio, .1, 10000);

//////////////////////////////
/// skybox...
//	geometry
let positions = [20,-20,20,20,20,20,-20,-20,20,20,20,20,-20,20,20,-20,-20,20,20,-20,-20,20,20,-20,20,-20,20,20,20,-20,20,20,20,20,-20,20,-20,-20,-20,-20,20,-20,20,-20,-20,-20,20,-20,20,20,-20,20,-20,-20,-20,-20,20,-20,20,20,-20,-20,-20,-20,20,20,-20,20,-20,-20,-20,-20,20,20,20,20,20,-20,-20,20,20,20,20,-20,-20,20,-20,-20,20,20,20,-20,-20,20,-20,20,-20,-20,-20,20,-20,20,-20,-20,20,-20,-20,-20];

positions = positions.map((v) => {return v*2} )

let indices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35];

console.log(positions.length);

const skyboxGeometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addIndex(indices);

const textureCube = PIXI.CubeTexture.from(
	'assets/posx.jpg',
	'assets/negx.jpg',
	'assets/posy.jpg',
	'assets/negy.jpg',
	'assets/posz.jpg',
	'assets/negz.jpg'
	);

const uniformsCube = {
	texture:textureCube,
	view,
	proj
}


const vsSky = require('./shaders/skybox.vert')();
const fsSky = require('./shaders/skybox.frag')();

const skyBoxShader = PIXI.Shader.from(vsSky, fsSky, uniformsCube);

const skyBox = new PIXI.mesh.RawMesh(skyboxGeometry, skyBoxShader);

stage.addChild(skyBox);

//////////////////////////////
///
///
//	texture
const texture = PIXI.Texture.from('./assets/ao-car.jpg');

const uniforms = {
	texture:textureCube,
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
	mesh.start = geometry.drawCalls[1].start
	mesh.size = geometry.drawCalls[1].size + geometry.drawCalls[2].size + geometry.drawCalls[3].size

	console.table(geometry.attributes);
	console.log(geometry);

	stage.addChild(mesh);

	loop();
});

const normalMatrix = mat3.create();
const vInverseMatrix = mat3.create();

function loop() {
	shader.uniforms.time += 0.005;
	requestAnimationFrame(loop);

	cameraControl.update();

	/// up date matrix..
	// theres no model matrix here!
	mat3.normalFromMat4(normalMatrix,  view);

	mat3.normalFromMat4(vInverseMatrix,  view);
	mat3.invert(vInverseMatrix,  vInverseMatrix);

	//uniforms.mvMatrix = controls.viewMatrix;
	uniforms.normalMatrix = normalMatrix;
	uniforms.vInverseMatrix = vInverseMatrix;
	uniforms.time += 0.1

	renderer.render(stage);
}

function resize() {

}