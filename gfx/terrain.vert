precision mediump float;

attribute vec2 aPosition;
varying vec2 vPosition; 

uniform vec2 uResolution; // Größe des Objekts (Width, Height)
uniform vec2 uRectPos;    // Position des Objekts im Pixi-Canvas

void main() {

    gl_Position = vec4(aPosition,0.0,0.0);
    vPosition = aPosition;

     // Normiere die Position auf den PixiJS-Viewport (Canvas-Bereich)
    //vec2 clipSpace = (aPosition / uResolution) * 2.0 - 1.0;
    // OpenGL verwendet Y nach oben, Pixi nach unten -> Y invertieren
    //gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
    // vPosition sollte als 0-1 UV-Wert bleiben
    //vPosition = (aPosition - uRectPos) / uResolution;
}
