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
uniform vec2 uSun;
uniform vec2 uResolution; // Bildschirmauflösung (width, height)
uniform vec2 uMenuTop; // Bildschirmauflösung (width, height)

void main() {
    vec4 topColor = vec4(uR, uG, uB, uA); 
    vec4 bottomColor = vec4(1.0,1.0,1.0, 1.0);  
    float distSun = distance(vPosition, uSun);
    float brightness = 1.5;
    float xFactor = 0.1-distance(vPosition.x,uPercentage);
    float adjustedThreshold = uThreshold * xFactor;
    float mixFactor = smoothstep(adjustedThreshold - 0.1, adjustedThreshold + 0.1, vPosition.y);
    if (vPosition.x < uPercentage) {
        bottomColor = mix(bottomColor, topColor, 1.2-distance(uPercentage, vPosition.x));
    }

    vec4 baseColor = mix(bottomColor, topColor, mixFactor);
    vec4 brightColor = vec4(topColor.rgb * brightness, topColor.a);
    brightColor.rgb = clamp(brightColor.rgb, 0.0, 1.0);
    baseColor = mix(brightColor, baseColor, distSun);

    if (gl_FragCoord.y > uResolution[1]-uMenuTop[1]) {
         baseColor = mix(baseColor, vec4(0.0,0.0,0.0,0.5), 0.1);
    }
    if (vPosition.y > 0.995) {
         if (vPosition.x < uPercentage) {
            baseColor = vec4(1.0,0.0,0.0,1.0);
        } else {    
            baseColor = vec4(1.0,1.0,1.0,0.0);
        }
    }

    gl_FragColor = baseColor;

}
