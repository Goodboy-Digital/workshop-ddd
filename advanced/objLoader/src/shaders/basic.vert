precision highp float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normals;

uniform mat4 view;
uniform mat4 proj;

varying vec2 vTextureCoord;
varying vec3 vNormal;

void main(void) {
    gl_Position = proj * view * vec4(position, 1.0);
    vTextureCoord = uv;
    vNormal = normals;
}