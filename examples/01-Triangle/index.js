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
const indices = [0, 1, 2];
const geometry = 	new PIXI.mesh.Geometry()
					.addAttribute('aVertexPosition', positions, 3).
					addIndex(indices);
//	shader
const shader = new PIXI.Shader.from(`
	precision highp float;
	attribute vec3 aVertexPosition;

	void main() {
		gl_Position = vec4(aVertexPosition, 1.0);
	}
	`,`
	precision highp float;
	void main() {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}
	`
	);

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