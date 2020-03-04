precision highp float;

uniform vec3 color;
uniform float opacity;

varying vec3 vNormal;

float diffuse(vec3 N, vec3 L) {
  return max(dot(N, normalize(L)), 0.0);
}

vec3 diffuse(vec3 N, vec3 L, vec3 C) {
  return diffuse(N, L) * C;
}

void main(void) {
  float d = diffuse(vNormal, vec3(1.0, 0.8, 0.6));
  vec3 c = color + d * 0.2;
  gl_FragColor = vec4(c, opacity);
}