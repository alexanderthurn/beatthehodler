precision mediump float;
varying vec2 vPosition;
varying vec4 vColor;

uniform float uThreshold;  // Schwellenwert für den unteren Bereich
uniform float uCurveStrength; // Stärke der Kurve für die X-Position
uniform float uTime; // Zeiteinfluss für Animation

void main() {

    vec4 topColor = vec4(0.0, 0.0, 0.0, 0.0);  
    vec4 bottomColor = vColor;

    float modifiedCurveStrength = uCurveStrength* (1.0+sin(uTime*0.005)*0.25);
    float xFactor = 1.0 - pow(abs(vPosition.x - 0.5) * 2.0, modifiedCurveStrength);
    float adjustedThreshold = uThreshold * xFactor;
    float mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);
    gl_FragColor = mix(bottomColor, topColor, mixFactor);
}