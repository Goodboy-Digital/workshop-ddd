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
let positions = [1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1];
let indices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35];

const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addIndex(indices);

const size = 3;
const positionSquare = [
	-size,  size, 0,
	 size,  size, 0,
	 size, -size, 0,
	-size, -size, 0
]
const uvsSquare = [
	0, 0,
	1, 0,
	1, 1,
	0, 1
]
const indicesSquare = [0, 1, 2, 0, 2, 3];
const geometrySquare = new PIXI.mesh.Geometry()
						.addAttribute('aVertexPosition', positionSquare, 3)
						.addAttribute('aUV', uvsSquare, 2)
						.addIndex(indicesSquare);

//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 10);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);


//	texture
const texture = PIXI.CubeTexture.from(
	'assets/posx.jpg',
	'assets/negx.jpg',
	'assets/posy.jpg',
	'assets/negy.jpg',
	'assets/posz.jpg',
	'assets/negz.jpg'
	);

//	fbo
const fboSize = 512;
const fbo = new PIXI.FrameBuffer(fboSize, fboSize)
.addColorTexture(0)
.addColorTexture(1)
.enableDepth();

for(var s in renderer) {
	console.log(s, renderer[s]);
}

const uniforms = {
	texture,
	view,
	proj
}

const uniformsSquare = {
	texture:fbo.colorTextures[1],
	view,
	proj
}


const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();

const vsSquare = require('./shaders/square.vert')();
const fsSquare = require('./shaders/square.frag')();


//	shader
const shader       = PIXI.Shader.from(vs, fs, uniforms);
const shaderSquare = PIXI.Shader.from(vsSquare, fsSquare, uniformsSquare);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;
const meshSquare = new PIXI.mesh.RawMesh(geometrySquare, shaderSquare);
meshSquare.state.depthTest = true;

// stage.addChild(mesh);
stage.addChild(meshSquare);

// console.log('framebuffer' , renderer.framebuffer);

loop();


function loop() {
	requestAnimationFrame(loop);

	cameraControl.update();

	renderer.framebuffer.bind(fbo);
	renderer.framebuffer.clear();

	renderer.plugins.mesh.render(mesh);

	renderer.framebuffer.bind(null);
	renderer.render(stage);
}

function resize() {

}