// basic.vert
precision highp float;
attribute vec3 aVertexPosition;

void main() {
	gl_Position = vec4(aVertexPosition, 1.0);
}