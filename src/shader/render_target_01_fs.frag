float PI = 3.141592653589793238;

uniform float time;
uniform sampler2D texture1;
uniform vec4 resolution;
uniform vec3 u_color[5];
uniform float u_fresnel_speed;
uniform float u_fresnel_tile;

varying vec2 vUv;
varying vec3 vPosition;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);

		/*
		// Moving UV
	*/
	// vec2 panning_vUv = fract(vUv - time * u_fresnel_speed);
	vec2 panning_vUv = fract((vUv * u_fresnel_tile) - time * u_fresnel_speed);

	/*
		// 1. Use texture map
	*/
	// vec4 fianl_color = texture2D(u_LUT_map, panning_vUv);

	/*
		// 2. Use step gradient
	*/
	float zero = 0.0;
	float color_num = 5.0;
	float color_gap = 1.0/color_num;
	vec3 color = u_color[0];

	// color = mix(color, u_color[1], smoothstep(zero + color_gap * 0.0, zero + color_gap * 1.0, panning_vUv.x));
	// color = mix(color, u_color[2], smoothstep(zero + color_gap * 1.0, zero + color_gap * 2.0, panning_vUv.x));
	// color = mix(color, u_color[3], smoothstep(zero + color_gap * 2.0, zero + color_gap * 3.0, panning_vUv.x));
	// color = mix(color, u_color[4], smoothstep(zero + color_gap * 3.0, zero + color_gap * 4.0, panning_vUv.x));
	// color = mix(color, u_color[0], smoothstep(zero + color_gap * 4.0, zero + color_gap * 5.0, panning_vUv.x));

	for(int i = 0; i < 4; i++){
		color = mix(color, u_color[i+1], smoothstep(zero + color_gap * float(i), zero + color_gap * float(i+1), panning_vUv.x));
  }
	color = mix(color, u_color[0], smoothstep(zero + color_gap * 4.0, zero + color_gap * 5.0, panning_vUv.x));


	vec4 fianl_color = vec4(color, 1.0);
	gl_FragColor = fianl_color;

	// gl_FragColor = vec4(vUv,progress,1.);
}