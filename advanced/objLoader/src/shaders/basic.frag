precision highp float;

varying vec2 vTextureCoord;
varying vec3 vNormal;

uniform sampler2D texture;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

void main() {
	float d = diffuse(vNormal, vec3(1.0, 0.8, 0.6));
	vec3 color = texture2D(texture, vTextureCoord).rgb;
	color.rgb += d * 0.2;
	gl_FragColor = vec4(color, 1.0);
}