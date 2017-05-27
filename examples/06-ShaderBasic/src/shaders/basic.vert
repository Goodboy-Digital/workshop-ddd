// basic.vert
precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec3 aCenter;

uniform mat4 view;
uniform mat4 proj;
uniform float time;

varying vec3 vNormal;

void main() {

	vec3 relative = aVertexPosition - aCenter;
	float offset = sin(aVertexPosition.x + aVertexPosition.y + aVertexPosition.z + time) * 0.5 + 0.5;
	vec3 position = aCenter + relative * offset;

	gl_Position = proj * view * vec4(position, 1.0);

	vNormal = aNormal;
}