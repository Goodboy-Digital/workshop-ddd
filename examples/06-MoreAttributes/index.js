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
const shader = new PIXI.Shader.from(`
	precision highp float;
	attribute vec3 aVertexPosition;
	attribute vec3 aNormal;
	attribute vec3 aCenter;

	uniform mat4 view;
	uniform mat4 proj;
	uniform float time;

	varying vec3 vNormal;

	void main() {

		vec3 relative = aVertexPosition - aCenter;
		float offset = sin(aVertexPosition.x + aVertexPosition.y + aVertexPosition.z + time) * 0.5 + 0.5;
		vec3 position = aCenter + relative * offset;

		gl_Position = proj * view * vec4(position, 1.0);

		vNormal = aNormal;
	}
	`,`
	precision highp float;

	varying vec3 vNormal;

	float diffuse(vec3 N, vec3 L) {
		return max(dot(N, normalize(L)), 0.0);
	}
	
	void main() {
		float d = diffuse(vNormal, vec3(1.0));
		gl_FragColor = vec4(vec3(d), 1.0);
	}
	`
	, uniforms);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);
mesh.state.depthTest = true;

stage.addChild(mesh);

loop();


function loop() {
	requestAnimationFrame(loop);

	cameraControl.update();

	uniforms.time += 0.03;
	renderer.render(stage);
}

function resize() {

}