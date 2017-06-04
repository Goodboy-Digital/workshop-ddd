// square.frag
precision highp float;
varying vec2 vUV;
uniform sampler2D texture;

void main(void) {
    gl_FragColor = texture2D(texture, vUV);
}