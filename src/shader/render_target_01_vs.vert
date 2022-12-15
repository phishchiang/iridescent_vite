float PI = 3.141592653589793238;

uniform vec2 pixels;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}