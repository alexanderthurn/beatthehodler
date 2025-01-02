precision mediump float;
varying vec2 vPosition;
varying vec4 vColor;

uniform float uThreshold;      // Schwellenwert für den unteren Bereich
uniform float uCurveStrength; // Stärke der Kurve für die X-Position
uniform float uTime;           // Zeiteinfluss für Animation

void main() {
    vec4 topColor = vec4(0.957, 0.706, 0.0, 1.0);  
    topColor = vec4(0.522, 0.733, 0.396, 1.0);  

    vec4 bottomColor = vec4(1.0,1.0,1.0, 1.0); 
    
    float modifiedCurveStrength = uCurveStrength * (1.0 + sin(uTime * 0.005) * 0.25);
    float xFactor = 1.0 - pow(abs(vPosition.x - 0.5) * 2.0, modifiedCurveStrength);
    float adjustedThreshold = uThreshold * xFactor;
    float mixFactor;
    float radius = 0.3;
    //mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);

    if (vPosition.y < 0.5) {
        mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);
    } else {
       // mixFactor = 1.0-smoothstep(radius, radius-0.3, distance(vPosition, vec2(0.0,1.0)));

        // Kugel bei x = 0
        float distLeft = distance(vec2(vPosition.x*0.25, vPosition.y), vec2(0.0, 1.0));
        float circleLeft = 1.0-smoothstep(radius, radius - 0.3, distLeft);

      
        // Kombiniere die beiden Kugeln
        mixFactor = circleLeft;
    }
   

    vec4 baseColor = mix(bottomColor, topColor, mixFactor);

    gl_FragColor = baseColor;
}
