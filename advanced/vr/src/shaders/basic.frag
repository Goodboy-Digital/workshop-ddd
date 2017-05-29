precision highp float;

varying vec2 vUV;

uniform sampler2D texture;


void main() {
	gl_FragColor = texture2D(texture, vUV);
}