async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}



function createThickLine(points, lineWidth) {
    const vertices = [];
    for (let i = 0; i < points.length - 2; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[i + 2];
        const y2 = points[i + 3];

        // Vektor für die Linie
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalisierte Orthogonalrichtung für die Breite
        const nx = -dy / length;
        const ny = dx / length;

        // Oberer und unterer Punkt für die Breite der Linie
        vertices.push(
            x1 + nx * lineWidth, y1 + ny * lineWidth, // Oberer Punkt 1
            x1 - nx * lineWidth, y1 - ny * lineWidth, // Unterer Punkt 1
            x2 + nx * lineWidth, y2 + ny * lineWidth, // Oberer Punkt 2
            x2 - nx * lineWidth, y2 - ny * lineWidth  // Unterer Punkt 2
        );
    }
    return new Float32Array(vertices);
}


function createThickLine(points, lineWidth) {
    const vertices = [];
    for (let i = 0; i < points.length - 2; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[i + 2];
        const y2 = points[i + 3];

        // Vektor für die Linie
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Normalisierte Orthogonalrichtung für die Breite
        const nx = -dy / length;
        const ny = dx / length;

        // Oberer und unterer Punkt für die Breite der Linie
        vertices.push(
            x1 + nx * lineWidth, y1 + ny * lineWidth, // Oberer Punkt 1
            x1 - nx * lineWidth, y1 - ny * lineWidth, // Unterer Punkt 1
            x2 + nx * lineWidth, y2 + ny * lineWidth, // Oberer Punkt 2
            x2 - nx * lineWidth, y2 - ny * lineWidth  // Unterer Punkt 2
        );
    }
    return new Float32Array(vertices);
}

function createThickLineColors(points) {
    const colors = [];
    for (let i = 0; i < points.length - 2; i += 2) {
        const y1 = points[i + 1]; // Aktueller Y-Wert
        const y2 = points[i + 3]; // Nächster Y-Wert

        // Farbe abhängig von Y-Wert-Differenz
        const color = y2 < y1 ? [0, 1, 0, 1] : [1, 0, 0, 1]; // Rot oder Grün

        // Für jedes Segment (4 Punkte: 2 oben, 2 unten) dieselbe Farbe
        colors.push(...color, ...color, ...color, ...color);
    }
    return new Float32Array(colors);
}

function createGraph(graphPoints, graphVertexShader, graphFragmentShader) {
    const geometry = new PIXI.Geometry({
        attributes: {
            aPosition: createThickLine(graphPoints,50),
            aColor: createThickLineColors(graphPoints),
        },
        topology: 'triangle-strip'
    });

    const shader = new PIXI.Shader({
        glProgram: new PIXI.GlProgram({ 
            vertex: graphVertexShader, 
            fragment: graphFragmentShader, 
            }),
        resources: {
            graphUniforms: {
                uScale: { value: [1.0, 1.0], type: 'vec2<f32>' },
            }
        }
    });


    const graph = new PIXI.Mesh({
        geometry,
        shader
    });
    return graph
}

const test = new Float32Array([
    0,0,
    100, 400,
    200, 500, 
    300, 100,  
    400, 250 
])



function createBackground(vertexShader, fragmentShader)  {

    var geometry = new PIXI.Geometry({
        attributes: {
            aPosition:  new Float32Array([
                -1, -1, // Linke untere Ecke
                 1, -1, // Rechte untere Ecke
                -1,  1, // Linke obere Ecke
                 1,  1  // Rechte obere Ecke
            ])
        },
        topology: 'triangle-strip'
    });

    const shader = new PIXI.Shader({
        glProgram: new PIXI.GlProgram({ 
            vertex: vertexShader, 
            fragment: fragmentShader, 
            }),
        resources: {
            backgroundUniforms: {
                uMode: {type: 'i32', value: 1},
                uThreshold: {type: 'f32', value: 0.05},
                uCurveStrength: {type: 'f32', value: 1.5},
            }
        }
    });

    const graph = new PIXI.Mesh({
        geometry,
        shader
    });
    return graph
}
         