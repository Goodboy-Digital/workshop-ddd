precision highp float;

varying vec3 vVertex;

uniform samplerCube texture;


void main() {
	gl_FragColor = textureCube(texture, vVertex);
}