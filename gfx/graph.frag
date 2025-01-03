varying vec4 vColor;
varying vec2 vPosition;

void main() {

    vec4 bottomColor = vec4(1.0,1.0,1.0, 0.1);  


    //float xFactor = vPosition.x;

    //vec4 baseColor = mix(vColor, bottomColor, xFactor);
    gl_FragColor = bottomColor;


     //gl_FragColor = vColor;
}