varying vec4 vColor;
varying vec2 vPosition;
varying float vPrice;

uniform vec2 uSun;
uniform float uR;           // color
uniform float uG;           // color
uniform float uB;           // color
uniform float uA;           // color

void main() {

    vec4 bottomColor = vec4(1.0,1.0,1.0, 0.1);  
    vec4 baseColor = vColor;
    vec4 topColor =vec4(uR, uG, uB, uA); 

    float distSun = distance(vPosition, uSun)*1.3;
    float clampedDist = clamp(distSun, 0.0, 1.0);
    baseColor = mix(topColor,baseColor, clampedDist);

    gl_FragColor = baseColor;

    if (vPrice < 0.0) {
        gl_FragColor = bottomColor;
    }
}