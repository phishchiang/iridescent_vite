float PI = 3.141592653589793238;

uniform float time;
uniform float progress;
uniform sampler2D u_render_target_01;
uniform vec4 resolution;

uniform sampler2D u_map_monkey_N;

varying vec2 vUv;
varying vec3 vPosition;

varying vec3 v_normal;
varying vec3 v_world_position;

vec2 distord ( vec2 uv, float progress_val, float zoom ) {
	vec2 normalized_uv = 2.0 * uv - 1.0; // 0~1 > -1~1
	vec2 distorted_uv = normalized_uv/(1.0 - progress_val * length(normalized_uv) * zoom);
	/*
	if progress = 0, everything will be the same
	if progress = 1, 
		the further away from the center, the bigger of the value will be
	*/
	return (distorted_uv + 1.0) * 0.5;
}

void main()	{
	/*
		// Multiply the normap map with its model normal.
	*/
	vec4 map_normal = texture2D(u_map_monkey_N, vUv);
	vec3 model_with_N = v_normal * map_normal.xyz;

	vec3 cam_dir = normalize(cameraPosition - v_world_position);
  float fresnel_uv = pow(dot(model_with_N, cam_dir), 1.0);
  fresnel_uv = clamp(1.0 - fresnel_uv, 0.0, 1.0);

	vec4 fianl_color = texture2D(u_render_target_01, vec2(fresnel_uv));
	
	float fresnel_mask = pow(dot(v_normal, cam_dir) * 1.35, 1.0);
  fresnel_mask = clamp(1.0 - fresnel_mask, 0.0, 1.0);
  fresnel_mask *= 2.0;
	vec4 mask_color = vec4(vec3(fresnel_mask), 1.0);

	fianl_color *= mask_color;


	// fianl_color = texture2D(model_with_N.xyz, vUv);

	gl_FragColor = fianl_color;
}