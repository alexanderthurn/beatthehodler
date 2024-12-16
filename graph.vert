precision mediump float;

attribute vec2 aPosition;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;

void main() {
    vec3 pos = projectionMatrix * translationMatrix * vec3(aPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}