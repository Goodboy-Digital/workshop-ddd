// basic.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
	gl_Position = vec4(aVertexPosition, 1.0);

	vColor = aColor;
}