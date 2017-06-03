precision highp float;

varying vec3 vTransformedNormal;
varying vec4 vPosition;

uniform mat3 vInverseMatrix;
uniform samplerCube texture;


void main() {

	vec3 incident_eye = normalize(vPosition.xyz);
	vec3 normal = normalize(vTransformedNormal);

	vec3 reflected = reflect(incident_eye, normal);

	float ratio = 1.03;//1.0 /1.3333;
	vec3 refracted = refract(incident_eye, normal, ratio);

	// convert from eye to world space
	reflected = vec3(vInverseMatrix * reflected);
	refracted = vec3(vInverseMatrix * refracted);

	vec4 sampleReflected = textureCube(texture, reflected);
	vec4 sampleRefracted = textureCube(texture, refracted);

	gl_FragColor = mix(sampleReflected, sampleRefracted, 0.8);

}
