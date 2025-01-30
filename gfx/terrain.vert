precision mediump float;

attribute vec2 aPosition;
varying vec2 vPosition; 

void main() {

    gl_Position = vec4(aPosition,0.0,0.0);
    vPosition = aPosition;
}
