precision mediump float;
varying vec2 vPosition;

uniform float uThreshold;  // Schwellenwert für den unteren Bereich
uniform int uMode;         // Modus: 0 = Blau/Grün, 1 = Schwarz/Orange
uniform float uCurveStrength; // Stärke der Kurve für die X-Position

void main() {

// Farben für beide Modi
    vec4 topColor = (uMode == 0) ? vec4(0.0, 0.0, 1.0, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);   // Blau oder Schwarz
    vec4 bottomColor = (uMode == 0) ? vec4(0.0, 1.0, 0.0, 1.0) : vec4(1.0, 0.5, 0.0, 1.0); // Grün oder Orange

 // Berechnung des X-Faktors (am Rand stärkerer Einfluss auf Threshold)
    float xFactor = 1.0 - pow(abs(vPosition.x - 0.5) * 2.0, uCurveStrength);

    // Threshold abhängig von X-Faktor, um Ränder weiter "unten" zu halten
    float adjustedThreshold = uThreshold * xFactor;

    // Y-Verlauf basierend auf adjustedThreshold
    float mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);

    gl_FragColor = mix(bottomColor, topColor, mixFactor);
}