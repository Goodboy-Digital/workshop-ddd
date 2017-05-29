#extension GL_EXT_draw_buffers : require

precision highp float;

varying vec3 vVertex;

uniform samplerCube texture;


void main() {
	gl_FragData[1] = textureCube(texture, vVertex);
}