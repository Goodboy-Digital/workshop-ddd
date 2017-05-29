import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import Model from './model';
import parseObj from './objParser';

//	initialize pixi
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
document.body.appendChild(renderer.view);

//	events
document.body.addEventListener('resize', resize);

//	stage
const stage = new PIXI.Stage();

//	geometry
let positions = [];
let uvs = [];
let indices = [0, 1, 2, 0, 2, 3];

const size = 2;
positions = positions.concat([-size, size, 0]);
positions = positions.concat([ size, size, 0]);
positions = positions.concat([ size,-size, 0]);
positions = positions.concat([-size,-size, 0]);

uvs = uvs.concat([0, 0]);
uvs = uvs.concat([1, 0]);
uvs = uvs.concat([1, 1]);
uvs = uvs.concat([0, 1]);

const geometry = parseObj(Model);
console.log(geometry);

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 5);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


//	texture
const texture = PIXI.Texture.from('assets/ao-map.jpg');

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