// basic.vert
precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normals;

uniform mat4 view;
uniform mat4 proj;
uniform float time;

varying vec2 vUV;
varying vec3 vNormal;

void main() {
	gl_Position = proj * view * vec4(position, 1.0);

	vUV = uv;
	vNormal = normals;
}