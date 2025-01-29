varying vec4 vColor;
varying vec2 vPosition;
varying float vPrice;
varying float vPriceFlat;
varying float vIndex;

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


/*
    if (mod(vPrice,100.0) >= 99.0) {
        gl_FragColor = bottomColor;
    }

    if (mod(vIndex,10.0) > 9.9 ) {
        gl_FragColor = bottomColor;

    }

    vec4 snowColor = vec4(0.9, 0.9, 1.0, 1.0);  // Schnee/Eis (weiß/bläulich)
    vec4 rockColor = vec4(0.6, 0.6, 0.6, 1.0);  // Felsen (grau)
    vec4 grassColor = vec4(0.2, 0.8, 0.2, 1.0); // Wiese (grün)
    vec4 dirtColor = vec4(0.6, 0.4, 0.2, 1.0);  // Erde (braun)
    vec4 floorColor = vec4(0.3, 0.2, 0.1, 1.0);  // Basis (dunkelbraun)

    if (vPrice > 80000.0) {
        gl_FragColor = snowColor;  
    } else if (vPrice > 60000.0) {
        gl_FragColor = rockColor;
    } else if (vPrice > 30000.0) {
        gl_FragColor = grassColor;
    } else if (vPrice > 10000.0) {
        gl_FragColor = dirtColor;
    } else {
        gl_FragColor = floorColor; 
    }

    if (vPrice > vPriceFlat*0.1) {
        gl_FragColor = snowColor;
    }*/

}