varying vec4 vColor;
varying vec2 vPosition;
varying vec2 vUV;

uniform sampler2D uTexture;

void main() {
     gl_FragColor = texture2D(uTexture, vUV);
     //gl_FragColor = vec4(1.0,0.0,1.0, 0.5);
     //gl_FragColor = vec4(vUV,0.0,1.0);
}