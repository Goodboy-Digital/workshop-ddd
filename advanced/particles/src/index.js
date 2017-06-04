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

//	settings
const random = function(min, max) { return min + Math.random() * (max - min);	}
const numParticles = 64 * 2;


//	camera
//	1. view matrix
const view = mat4.create();
const cameraControl = new OrbitalCameraControl(view, 15);

//	2. projection matrix
const proj = mat4.create();
const rad = Math.PI/180;
const ratio = window.innerWidth / window.innerHeight;
mat4.perspective(proj, 45 * rad, ratio, .1, 100);

//	init position
const range = 4;
const posData = new Float32Array(4 * numParticles * numParticles);
const velData = new Float32Array(4 * numParticles * numParticles);
const extraData = new Float32Array(4 * numParticles * numParticles);

for(let i=0; i<posData.length; i+=4) {
	posData[i + 0] = random(-range, range); 
	posData[i + 1] = random(-range, range); 
	posData[i + 2] = random(-range, range); 
	posData[i + 3] = 1;

	extraData[i + 0] = Math.random();
	extraData[i + 1] = Math.random();
	extraData[i + 2] = Math.random();
	extraData[i + 3] = 1;
}

//	FBOS
const fbo0 = new PIXI.FrameBuffer(numParticles, numParticles)
.addColorTexture(0, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, posData))
.addColorTexture(1, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, velData))
.addColorTexture(2, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, extraData))


const fbo1 = new PIXI.FrameBuffer(numParticles, numParticles)
.addColorTexture(0, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, posData))
.addColorTexture(1, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, velData))
.addColorTexture(2, new PIXI.BaseTexture.fromFloat32Array(numParticles, numParticles, extraData))

fbo0.colorTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
fbo1.colorTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

fbo0.colorTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;
fbo1.colorTexture.wrapMode = PIXI.WRAP_MODES.CLAMP;

let flop = fbo0;



//	RENDER PARTICLES

// 	geometry particles
let uvParticles = [];
const indicesParticles = []
let count = 0;
for(let i=0; i<numParticles; i++) {
	for(let j=0; j<numParticles; j++) {
		let u = i/numParticles + 0.5/numParticles;
		let v = j/numParticles + 0.5/numParticles;
		uvParticles = uvParticles.concat([u, v]);
		indicesParticles.push(count);
		count ++;
	}
}

const geometryParticles = new PIXI.mesh.Geometry()
					.addAttribute('aTextureCoord', uvParticles, 2)
					.addIndex(indicesParticles);

//	shader particles
const vsRender = require('./shaders/render.vert')();
const fsRender = require('./shaders/render.frag')();

const uniformsRender = {
	texture:fbo0.colorTextures[0],
	textureExtra:fbo0.colorTextures[2],
	view,
	proj
}

const shaderRender = PIXI.Shader.from(vsRender, fsRender, uniformsRender);
const meshParticles = new PIXI.mesh.RawMesh(geometryParticles, shaderRender, null, PIXI.DRAW_MODES.POINTS);
meshParticles.state.depthTest = true;



//	UPDATE PARTICLE POSITIONS
//	geometry sim
let posQuad = [ -1,  1, 0, 1,  1, 0, 1, -1, 0, -1, -1, 0 ];
let uvQuad = [  0, 1,  1, 1,  1, 0,  0, 0 ];

let indices = [0, 1, 2, 0, 2, 3];
const geometryQuad = new PIXI.mesh.Geometry()
.addAttribute('aVertexPosition', posQuad, 3)
.addAttribute('aTextureCoord', uvQuad, 2)
.addIndex(indices);


const vsSim = require('./shaders/sim.vert')();
const fsSim = require('./shaders/sim.frag')();

const uniformsSim = {
	texturePos:fbo0.colorTextures[0],
	textureVel:fbo0.colorTextures[1],
	textureExtra:fbo0.colorTextures[2],
	time:Math.random() * 0xFF
}
const shaderSim = PIXI.Shader.from(vsSim, fsSim, uniformsSim);
const meshSim = new PIXI.mesh.RawMesh(geometryQuad, shaderSim);


const uniformsPass = {
	texture:fbo0.colorTextures[0],
	view,
	proj
}

const vs = require('./shaders/pass.vert')();
const fs = require('./shaders/pass.frag')();

//	shader
const shaderPass = PIXI.Shader.from(vs, fs, uniformsPass);

//	mesh
const meshPass = new PIXI.mesh.RawMesh(geometryQuad, shaderPass);
meshPass.state.depthTest = true;


// stage.addChild(mesh);
// stage.addChild(meshSim);
stage.addChild(meshParticles);

loop();


function loop() {
	requestAnimationFrame(loop);

	//	update particle positions
	uniformsSim.texturePos = flop.colorTextures[0];
	uniformsSim.textureVel = flop.colorTextures[1];
	uniformsSim.textureExtra = flop.colorTextures[2];
	uniformsRender.textureExtra = flop.colorTextures[2];

	if(flop === fbo0) {
		flop = fbo1;
	} else {
		flop = fbo0;
	}
	uniformsSim.time += 0.005;
	renderer.framebuffer.bind(flop);
	renderer.framebuffer.clear();
	renderer.plugins.mesh.render(meshSim);
	renderer.framebuffer.bind(null);

	//	ping pong

	cameraControl.update();

	uniformsPass.texture = flop.colorTextures[2];
	

	renderer.plugins.mesh.render(meshParticles);

/*
	const s = 200;
	renderer.gl.viewport(0, 0, s, s);
	uniformsPass.texture = flop.colorTextures[0];
	renderer.plugins.mesh.render(meshPass);

	renderer.gl.viewport(s, 0, s, s);
	uniformsPass.texture = flop.colorTextures[1];
	renderer.plugins.mesh.render(meshPass);

	renderer.gl.viewport(s*2, 0, s, s);
	uniformsPass.texture = flop.colorTextures[2];
	renderer.plugins.mesh.render(meshPass);

	*/
}

function resize() {

}