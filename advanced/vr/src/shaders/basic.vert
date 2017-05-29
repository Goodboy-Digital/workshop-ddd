// basic.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 view;
uniform mat4 proj;
uniform float time;

varying vec2 vUV;
varying vec3 vNormal;

void main() {
	gl_Position = proj * view * vec4(aVertexPosition, 1.0);

	vUV = aTextureCoord;
	vNormal = aNormal;
}