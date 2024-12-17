precision mediump float;

attribute vec2 aPosition;
attribute vec4 aColor;
varying vec4 vColor;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
uniform vec2 uScale; // Skalierung für X und Y

void main() {
     vec2 scaledPosition = aPosition * uScale;
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(scaledPosition, 1.0)).xy, 0.0, 1.0);
    vColor = aColor;
}