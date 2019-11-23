#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float timeFactor;

void main() {
	vec4 color = texture2D(uSampler, vTextureCoord);
	
	float camera_x = vTextureCoord.x - 0.5;
	float camera_y = vTextureCoord.y - 0.5;

	float radius = camera_x * camera_x + camera_y * camera_y;
	float radial_factor = 1.0 - radius;
	if(radial_factor < 0.0) radial_factor = 0.0;
	radial_factor = pow(radial_factor, 5.0);

	vec4 radial_offset = vec4(vec3(1,1,1) * radial_factor, 1); 

	float whiteBarTime = mod(timeFactor, 2000.0) / 2000.0;

	float whiteBarFactor = mod(abs(whiteBarTime - vTextureCoord.y), 0.2);

	if(whiteBarFactor < 0.04 || whiteBarFactor > 0.16){
		vec3 whiteOffset = vec3(1.0,1.0,1.0) * 0.6;
		vec3 barColor = (vec3(color.x, color.y, color.z) + whiteOffset) / 2.0;
		gl_FragColor = vec4(barColor,1.0) * radial_offset;
	}
	else{
		gl_FragColor = color * radial_offset;
	}
}
