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
const r = 0.5;
const positions = [
	0, r, 0,
	r, -r, 0,
	-r, -r, 0
];
const colors = [
	1, 0, 0,
	0, 1, 0,
	0, 0, 1,
]
const indices = [0, 1, 2];
const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addAttribute('aColor', colors, 3)
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
	color:[1.0, 1.0, 1.0],
	time:0,
	view,
	proj
}

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

//	shader
const shader = new PIXI.Shader.from(vs, fs, uniforms);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);

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