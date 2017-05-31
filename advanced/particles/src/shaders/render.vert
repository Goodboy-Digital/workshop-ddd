// basic.vert

precision highp float;
attribute vec2 aTextureCoord;

uniform mat4 view;
uniform mat4 proj;
uniform sampler2D texture;
uniform sampler2D textureExtra;


varying vec3 vColor;

void main(void) {
	vec3 position = texture2D(texture, aTextureCoord).rgb;
    gl_Position = proj * view * vec4(position, 1.0);

    vec3 extra = texture2D(textureExtra, aTextureCoord).rgb;

    gl_PointSize = 4.0 + extra.b * 6.0;

    // vColor = vec3(aTextureCoord, 1.0);
    vColor = extra;
}