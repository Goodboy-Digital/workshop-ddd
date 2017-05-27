import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import SphereData from './sphere';

//	initialize pixi
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
document.body.appendChild(renderer.view);

//	events
document.body.addEventListener('resize', resize);

//	stage
const stage = new PIXI.Stage();

//	geometry
let centers = [];
const { positions, normals, indices } = SphereData;
let p0, p1, p2;
for(let i=0; i<positions.length; i += 9) {
	p0 = [positions[i+0], positions[i+1], positions[i+2]];
	p1 = [positions[i+3], positions[i+4], positions[i+5]];
	p2 = [positions[i+6], positions[i+7], positions[i+8]];

	let cx = (p0[0] + p1[0] + p2[0]) / 3;
	let cy = (p0[1] + p1[1] + p2[1]) / 3;
	let cz = (p0[2] + p1[2] + p2[2]) / 3;

	centers = centers.concat([cx, cy, cz]);
	centers = centers.concat([cx, cy, cz]);
	centers = centers.concat([cx, cy, cz]);
}



const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addAttribute('aNormal', normals, 3)
					.addAttribute('aCenter', centers, 3)
					.addIndex(indices);

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 5);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);

const uniforms = {
	time:0,
	view,
	proj
}

//	shader
const vs = require('./shaders/basic.vert')();
const vsNoise = require('./shaders/noise.vert')();
const fs = require('./shaders/basic.frag')();

//	shader
const shader = new PIXI.Shader.from(vsNoise, fs, uniforms);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;

stage.addChild(mesh);

loop();


function loop() {
	requestAnimationFrame(loop);

	cameraControl.update();

	uniforms.time += 0.01;
	renderer.render(stage);
}

function resize() {

}