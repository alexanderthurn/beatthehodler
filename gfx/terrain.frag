#version 300 es
precision mediump float;
out vec4 FragColor;
in vec2 TexCoord;

void main() {
    ivec2 pixelCoords = ivec2(gl_FragCoord.xy);

    if ((pixelCoords.x + pixelCoords.y) % 2 == 0)
        FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Rot
    else
        FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Grün
}
