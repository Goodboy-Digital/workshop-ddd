precision highp float;

varying vec3 vColor;

void main(void) {
	float d = distance(gl_PointCoord, vec2(.5));
	if(d > 0.5) discard;
	// const float g = 0.25;
    gl_FragColor = vec4(vColor, 1.0);
}