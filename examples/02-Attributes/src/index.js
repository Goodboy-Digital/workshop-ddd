import * as PIXI from 'pixi.js';

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
	r * 0.67, -r, 0,
	-r * 0.67, -r, 0
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

const vs = require('./shaders/basic.vert')();
const fs = require('./shaders/basic.frag')();
//	shader
const shader = new PIXI.Shader.from(vs,fs);

//	mesh
const mesh = new PIXI.mesh.RawMesh(geometry, shader);

stage.addChild(mesh);

loop();


function loop() {
	requestAnimationFrame(loop);

	renderer.render(stage);
}

function resize() {

}