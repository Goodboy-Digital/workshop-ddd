import * as PIXI from 'pixi.js';
import { mat4, vec3 } from 'gl-matrix';
import OrbitalCameraControl from './OrbitalCameraControl';
import Cube from './Cube';

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
const { positions, uvs, normals, indices } = Cube;

const num = 10;
const gap = 2;
let posOffset = [];

for(let i=0; i<num; i++) {
	for(let j=0; j<num; j++) {
		for(let k=0; k<num; k++) {
			let x = (-num/2 + i) * gap + gap * 0.5;
			let y = (-num/2 + j) * gap + gap * 0.5;
			let z = (-num/2 + k) * gap + gap * 0.5;

			posOffset = posOffset.concat([x, y, z]);
		}
	}
}

console.log(posOffset.length, positions.length);

const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3)
					.addAttribute('aNormal', normals, 3)
					.addAttribute('aPosOffset', posOffset, 3, false, PIXI.TYPES.FLOAT, 0, 0, true)
					.addAttribute('aUV', uvs, 2)
					.addIndex(indices);

geometry.instanceCount = Math.pow(num, 3);

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
const texture = PIXI.Texture.from('assets/gradient.jpg');

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

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;

stage.addChild(mesh);

loop();


function loop() {
	shader.uniforms.time += 0.005;
	requestAnimationFrame(loop);

	cameraControl.update();

	renderer.render(stage);
}

function resize() {

}