precision highp float;
attribute vec3 position;
attribute vec3 normals;

uniform mat4 view;
uniform mat4 proj;
uniform mat3 normalMatrix;

varying vec4 vPosition;
varying vec3 vTransformedNormal;


void main(void) {
    gl_Position = proj * view * vec4(position, 1.0);

    vPosition = view * vec4(position, 1.);
    vTransformedNormal = normalMatrix * normals;
}