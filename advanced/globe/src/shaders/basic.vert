// basic.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aPosOffset;
attribute vec2 aUV;

uniform mat4 view;
uniform mat4 proj;
uniform float time;
uniform vec3 uPosition;
uniform float uScale;

varying vec2 vUV;
varying vec3 vNormal;

void main() {
	vec3 position = uPosition + aVertexPosition * uScale;
	gl_Position = proj * view * vec4(position, 1.0);

	vUV = aUV;
	vNormal = normalize(aVertexPosition);
}