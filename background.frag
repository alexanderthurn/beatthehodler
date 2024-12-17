precision mediump float;
varying vec2 vPosition;

uniform float uThreshold;  // Schwellenwert für den unteren Bereich
uniform int uMode;         // Modus: 0 = Blau/Grün, 1 = Schwarz/Orange

void main() {

     // Farben für beide Modi
    vec4 topColor = (uMode > 0) ? vec4(0.0, 1.0, 0.0, 1.0) : vec4(1.0, 0.0, 0.0, 1.0);   // Blau oder Schwarz
    vec4 bottomColor = (uMode > 0) ? vec4(0.0, 1.0, 0.0, 1.0) : vec4(1.0, 0.0, 0.0, 1.0); // Grün oder Orange

    float mixFactor = smoothstep(uThreshold - 0.05, uThreshold + 0.05, vPosition.y);
    gl_FragColor = mix(bottomColor, topColor, mixFactor);
}