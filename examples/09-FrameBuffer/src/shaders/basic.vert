// basic.vert
precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 view;
uniform mat4 proj;
uniform float time;

varying vec3 vVertex;

void main() {
	gl_Position = proj * view * vec4(aVertexPosition, 1.0);

	vVertex = aVertexPosition;
}