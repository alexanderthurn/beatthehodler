in vec2 vTextureCoord;
in vec4 vColor;

uniform sampler2D uTexture;

// Einfache Unschärferoutine
float gaussian(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * 3.14159) * sigma);
}

void main(void)
{
    vec2 uv = vTextureCoord;
    vec2 center = vec2(0.5, 0.5);
    float distanceFromCenter = distance(uv, center);
    float blurAmount = smoothstep(0.2, 0.5, distanceFromCenter); // 0.5 ist der Radius, an dem die Unschärfe beginnt

    vec4 color = texture(uTexture, uv);
    if (color.r < 0.99 || color.g < 0.99 || color.b < 0.99) {

        vec4 blurredColor = vec4(0.0);

        // Hier nehmen wir nur eine sehr einfache Blur-Methode, die Pixel in der Nähe des aktuellen Pixels betrachtet.
        for (int i = -2; i <= 2; ++i) {
            for (int j = -2; j <= 2; ++j) {
                vec2 offset = vec2(float(i), float(j)) * 0.005 * blurAmount; // Dies ist ein Platzhalter für die Blur-Intensität
                blurredColor += texture(uTexture, uv + offset) * gaussian(length(vec2(i, j)), 1.0);
            }
        }

        // Mischung zwischen normaler Farbe und unscharfer Farbe basierend auf der Entfernung vom Zentrum
        gl_FragColor = mix(color, blurredColor / 25.0, blurAmount); // 25.0 normalisiert die Summe der Gaussian-Werte (5x5 Kernel)
    } else {
         gl_FragColor = color;
    }
}