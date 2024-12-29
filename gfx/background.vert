precision mediump float;

attribute vec2 aPosition;
varying vec2 vPosition; 
varying vec4 vColor;
uniform vec4 uColor;

void main() {
    vPosition = aPosition * 0.5 + 0.5; // Normalisieren zu [0, 1]
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColor = uColor;
}
