// basic.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;
// attribute vec3 aPosOffset;
attribute vec2 aUV;

uniform mat4 view;
uniform mat4 proj;
uniform float time;

varying vec2 vUV;
varying vec3 vNormal;

void main() {
	// vec3 position = aVertexPosition + aPosOffset;
	gl_Position = proj * view * vec4(aVertexPosition, 1.0);

	vUV = aUV;
	vNormal = aNormal;
}