precision mediump float;

attribute vec2 aPosition;
attribute vec4 aColor;
attribute float aIndex;
attribute float aPrice;

varying vec4 vColor;
varying vec2 vPosition;
varying float vPrice;
varying float vPriceFlat;
varying float vIndex;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;
uniform vec2 uScale; // Skalierung für X und Y
uniform int uCurrentIndex;
uniform int uMaxVisiblePoints;
uniform float uAlpha;

void main() {
   
    if (int(aIndex) < uCurrentIndex-uMaxVisiblePoints || int(aIndex) > uCurrentIndex) {
    //    gl_Position = vec4(-2.0, -2.0, 0.0, 1.0);
    //    return;
    }

    vec2 scaledPosition = aPosition * uScale;
    scaledPosition.y=scaledPosition.y;
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(scaledPosition, 1.0)).xy, 0.0, 1.0);
    vColor = vec4(aColor.rgb, aColor.a * uAlpha);
    vPosition = gl_Position.xy;
    vPrice = aPrice;
    vPriceFlat = aPosition.y;
    vIndex = aIndex;
}