varying vec4 vColor;
varying vec2 vPosition;
uniform vec2 uSun;
uniform float uR;           // color
uniform float uG;           // color
uniform float uB;           // color
uniform float uA;           // color

void main() {

    vec4 bottomColor = vec4(1.0,1.0,1.0, 0.1);  
    vec4 baseColor = vColor;
    vec4 topColor =vec4(uR, uG, uB, uA); 

    float distSun = distance(vPosition, uSun);
    float clampedDist = clamp(distSun, 0.0, 1.0);
    baseColor = mix(topColor,baseColor, clampedDist);
     gl_FragColor = baseColor;
}