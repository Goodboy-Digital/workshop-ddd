precision highp float;

varying vec2 vUV;
varying vec3 vNormal;
varying float vNoise;

uniform sampler2D texture;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}


void main() {
	float d = diffuse(vNormal, vec3(0.6, 0.8, 1.0));
	d = mix(d, 1.0, .5);

	vec3 color = texture2D(texture, vec2(vNoise, .5)).rgb;
	gl_FragColor = vec4(color * d, 1.0);
}