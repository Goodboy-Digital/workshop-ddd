import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';

//	initialize pixi
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
document.body.appendChild(renderer.view);

//	events
document.body.addEventListener('resize', resize);

//	stage
const stage = new PIXI.Stage();

//	geometry
let positions = [20,-20,20,20,20,20,-20,-20,20,20,20,20,-20,20,20,-20,-20,20,20,-20,-20,20,20,-20,20,-20,20,20,20,-20,20,20,20,20,-20,20,-20,-20,-20,-20,20,-20,20,-20,-20,-20,20,-20,20,20,-20,20,-20,-20,-20,-20,20,-20,20,20,-20,-20,-20,-20,20,20,-20,20,-20,-20,-20,-20,20,20,20,20,20,-20,-20,20,20,20,20,-20,-20,20,-20,-20,20,20,20,-20,-20,20,-20,20,-20,-20,-20,20,-20,20,-20,-20,20,-20,-20,-20];
let indices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35];

console.log(positions.length);

const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addIndex(indices);

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 0.1);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


//	texture
console.log(PIXI.CubeTexture.from);
const texture = PIXI.CubeTexture.from(
	'assets/posx.jpg',
	'assets/negx.jpg',
	'assets/posy.jpg',
	'assets/negy.jpg',
	'assets/posz.jpg',
	'assets/negz.jpg'
	);

const uniforms = {
	texture,
	view,
	proj
}



const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

//	shader
const shader = new PIXI.Shader.from(vs, fs, uniforms);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;

stage.addChild(mesh);

loop();


function loop() {
	requestAnimationFrame(loop);

	cameraControl.update();

	renderer.render(stage);
}

function resize() {

}