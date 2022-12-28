float PI = 3.141592653589793238;

uniform vec2 pixels;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 v_normal;
varying vec3 v_world_position;

void main() {
  vUv = uv;
  v_normal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  v_world_position = (modelMatrix * vec4(position, 1.0)).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}