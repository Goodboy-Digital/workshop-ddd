import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import Sphere from './Sphere';

//	initialize pixi
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
document.body.appendChild(renderer.view);

console.log(renderer.clearColor);
window.renderer = renderer

//	events
document.body.addEventListener('resize', resize);

//	stage
const stage = new PIXI.Stage();

//	geometry
const { positions, uvs, indices } = Sphere;
const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addAttribute('aUV', uvs, 2)
					.addIndex(indices);

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 50);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


//	texture
const texture = PIXI.Texture.from('assets/earth.jpg');

const screenPos = vec3.create();
const a = Math.PI/2;
const x = Math.cos(a) * 10;
const z = Math.sin(a) * 10;
const tagPos = vec3.fromValues(x, 0, z);

const uniforms = {
	texture,
	view,
	proj,
	uScale:10,
	uPosition:[0, 0, 0],
	time:0
}

const uniformsColor = {
	view, 
	proj,
	uScale:1,
	color:[1, 1, 1],
	uPosition:tagPos,
	opacity:1
}

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();
const fsColor = require('./shaders/color.frag')();

//	shader
const shader = PIXI.Shader.from(vs, fs, uniforms);

//	shader color
const shaderColor = PIXI.Shader.from(vs, fsColor, uniformsColor);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;

const meshDot = new PIXI.mesh.RawMesh(geometry, shaderColor);
mesh.state.depthTest = true;

stage.addChild(mesh);
// stage.addChild(meshDot);


//	2D container
const container2D = new PIXI.Container();
stage.addChild(container2D);

const g = new PIXI.Graphics();
g.beginFill(0xFF6600);
g.drawRect(0, 0, 100, 25);
container2D.addChild(g);




loop();

window.addEventListener('resize', resize);

function loop() {
	vec3.transformMat4(screenPos, tagPos, view);
	vec3.transformMat4(screenPos, screenPos, proj);
	g.x = window.innerWidth * ((screenPos[0] + 1) /2);
	g.y = window.innerWidth - window.innerWidth * ((screenPos[1] + 1) /2);


	shader.uniforms.time += 0.005;
	requestAnimationFrame(loop);

	cameraControl.update();

	renderer.render(stage);
}

function resize() {
	renderer.resize(window.innerWidth, window.innerHeight);
	const ratio = window.innerWidth / window.innerHeight;
	mat4.perspective(proj, 45 * rad, ratio, .1, 100);
}