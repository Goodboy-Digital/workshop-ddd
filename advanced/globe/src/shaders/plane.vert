attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 view;
uniform mat4 proj;
uniform vec3 uPosition;
uniform float uScale;
uniform mat4 uRotate;

varying vec2 vTextureCoord;

void main() {
  vec4 position = vec4(uPosition, 0.0) + uRotate * vec4(aVertexPosition * uScale, 0.0, 1.0);
  gl_Position = proj * view * position;
  vTextureCoord = vec2(aTextureCoord.x, 1.0 - aTextureCoord.y);
}