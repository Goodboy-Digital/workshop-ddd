// basic.vert
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