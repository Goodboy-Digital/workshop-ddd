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
// const eye = vec3.fromValues(0, 0, 5);
// const center = vec3.fromValues(0, 0, 0);
// const up = vec3.fromValues(0, 1, 0);
// mat4.lookAt(view, eye, center, up);
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

//	shader
const shader = new PIXI.Shader.from(`
	precision highp float;
	attribute vec3 aVertexPosition;
	attribute vec3 aColor;

	uniform mat4 view;
	uniform mat4 proj;

	varying vec3 vColor;

	void main() {
		gl_Position = proj * view * vec4(aVertexPosition, 1.0);

		vColor = aColor;
	}
	`,`
	precision highp float;

	varying vec3 vColor;
	uniform vec3 color;
	uniform float time;
	
	void main() {
		float offset = sin(time) * 0.5 + 0.5;
		gl_FragColor = vec4(mix(vColor, color, offset), 1.0);
	}
	`
	, uniforms);

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