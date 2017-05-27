// square.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aUV;

uniform mat4 view;
uniform mat4 proj;

varying vec2 vUV;

void main() {
	gl_Position = proj * view * vec4(aVertexPosition, 1.0);

	vUV = aUV;
}