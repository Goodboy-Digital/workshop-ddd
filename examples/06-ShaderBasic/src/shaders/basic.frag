// basic.frag
precision highp float;

varying vec3 vNormal;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}

void main() {
	float d = diffuse(vNormal, vec3(1.0));
	d = mix(d, 1.0, .2);
	gl_FragColor = vec4(vec3(d), 1.0);
}