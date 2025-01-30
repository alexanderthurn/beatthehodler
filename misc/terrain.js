async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}

function createTerrain(app, vertexShader, fragmentShader)  {

   // let terrain = new PIXI.Graphics().rect(app.screen.width*0.25,app.screen.height*0.25, app.screen.width*0.5,app.screen.height*0.5).fill({color: 0xff0000, alpha: 1})
   let container = new PIXI.Container()
    let test = new PIXI.Graphics().rect(100,50, 300, 200).fill({color: 0xff00ff, alpha: 1})
    let terrain = new PIXI.Graphics().rect(150,100, 300, 200).fill({color: 0xff0000, alpha: 1})
    let mask = new PIXI.Graphics().rect(-100,-100, 550,250)
   // terrain.mask = mask
    const filter = new PIXI.Filter({
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

    terrain.filters = [filter]

    container.addChild(test)
    container.addChild(terrain)
    container.position.x = -20
    return container
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
    const terrain = createTerrain(app, backgroundVertexShader, backgroundFragmentShader);
    containerTerrain.addChildAt(terrain,0);

}


window.addEventListener("load", (event) => {
    initGame();
})