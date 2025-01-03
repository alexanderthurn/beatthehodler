precision mediump float;
varying vec2 vPosition;

uniform float uThreshold;      // Schwellenwert für den unteren Bereich
uniform float uCurveStrength; // Stärke der Kurve für die X-Position
uniform float uTime;           // Zeiteinfluss für Animation
uniform float uPercentage;           // How much of the level is compeled
uniform float uR;           // color
uniform float uG;           // color
uniform float uB;           // color
uniform float uA;           // color

void main() {
    vec4 topColor = vec4(0.957, 0.706, 0.0, 1.0);  
   // topColor = vec4(0.522, 0.733, 0.396, 1.0);  
    vec4 bottomColor = vec4(1.0,1.0,1.0, 1.0); 
    
 
  //  topColor = vec4(0.5,0.5,0.5, 0.0);
   // bottomColor = vec4(0.957, 0.706, 0.0, 1.0);  


    topColor =vec4(uR, uG, uB, uA); 
    bottomColor = vec4(1.0,1.0,1.0, 1.0);  


    float modifiedCurveStrength = uCurveStrength * (1.0 + sin(uTime * 0.005) * 0.25);
    float xFactor = 1.0 - pow(abs(vPosition.x - 0.5) * 2.0, modifiedCurveStrength);
    float adjustedThreshold = uThreshold * xFactor;
    float mixFactor;

    mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);
    if (vPosition.x < uPercentage) {
        bottomColor = mix(bottomColor, topColor, 1.2-distance(uPercentage, vPosition.x));
    }

    vec4 baseColor = mix(bottomColor, topColor, mixFactor);
    gl_FragColor = baseColor;
}
