precision highp float;
attribute vec3 position;
attribute vec3 normals;

uniform mat4 view;
uniform mat4 proj;
uniform mat3 normalMatrix;

uniform float time;

varying vec4 vPosition;
varying vec3 vTransformedNormal;


void main(void) {

	vec3 finalPosition = position;

	finalPosition.x += sin(finalPosition.y*2. + time) * 0.04;
	finalPosition.y += cos(finalPosition.x*2. + time) * 0.04;
	finalPosition.z += cos(finalPosition.z*2. + time) * 0.04;

    gl_Position = proj * view * vec4(finalPosition, 1.0);

    vPosition = view * vec4(finalPosition, 1.);
    vTransformedNormal = normalMatrix * normals;
}