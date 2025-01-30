async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}

function createTerrain(vertexShader, fragmentShader)  {

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
                uTime: {value: 0.0, type: 'f32'},
                uSun: { value: [0.75, 0.75], type: 'vec2<f32>' },
                uResolution: { value: [640.0, 480.0], type: 'vec2<f32>' },
            }
        }
    });

    const graph = new PIXI.Mesh({
        geometry,
        shader
    });
    return graph
}

async function initGame() {
        
    const backgroundVertexShader = await loadShader('../gfx/terrain.vert')
    const backgroundFragmentShader = await loadShader('../gfx/terrain.frag')

    const app = new PIXI.Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xf4b400,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window
    });

    document.body.appendChild(app.canvas);
    const containerTerrain = new PIXI.Container()
    app.stage.addChild(containerTerrain)
    const terrain = createTerrain(backgroundVertexShader, backgroundFragmentShader);
    containerTerrain.addChildAt(terrain,0);


}


window.addEventListener("load", (event) => {
    initGame();
})