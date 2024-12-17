precision mediump float;

attribute vec2 aPosition;
attribute vec4 aColor;
attribute float aIndex;

varying vec4 vColor;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
uniform vec2 uScale; // Skalierung für X und Y
uniform int uCurrentIndex;
uniform int uMaxVisiblePoints;

void main() {
   
    if (int(aIndex) < uCurrentIndex-uMaxVisiblePoints || int(aIndex) >= uCurrentIndex ) {
        gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
        return;
    }

    vec2 scaledPosition = aPosition * uScale;
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(scaledPosition, 1.0)).xy, 0.0, 1.0);
    vColor = aColor;
}