precision mediump float;
varying vec2 vPosition;

uniform float uTime;           // Zeiteinfluss für Animation
uniform vec2 uSun;
uniform vec2 uResolution; // Bildschirmauflösung (width, height)

void main() {
    vec2 localPos = gl_FragCoord.xy / uResolution;
    
    vec4 topColor = vec4(1.0,0.0,0.0, 1.0); 
    vec4 bottomColor = vec4(0.0,1.0,0.0, 1.0);  
    float distSun = distance(vPosition, uSun);
    vec4 baseColor = mix(topColor, bottomColor, distSun);



    gl_FragColor = baseColor;

}
