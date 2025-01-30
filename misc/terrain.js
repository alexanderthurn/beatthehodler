async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}

function createTerrain(app, vertexShader, fragmentShader, texture)  {

    let container = new PIXI.Container()
    let normalRect = new PIXI.Graphics().rect(100,50, 300, 200).fill({color: 0xff0000, alpha: 1})
    let blurRect = new PIXI.Graphics().rect(150,100, 300, 200).fill({color: 0x00ff00, alpha: 1})
    let terrainRect = new PIXI.Graphics().rect(200,150, 300, 200).fill({color: 0x0000ff, alpha: 1})


    let normalSprite = new PIXI.Sprite(texture)
    normalSprite.scale = 0.1
    normalSprite.x = 100+400
    normalSprite.y =50
    
    let blurSprite = new PIXI.Sprite(texture)
    blurSprite.scale = 0.1
    blurSprite.x = 150+400
    blurSprite.y = 100

    let terrainSprite = new PIXI.Sprite(texture)
    terrainSprite.scale = 0.1
    terrainSprite.x = 200+400
    terrainSprite.y = 150

    const shaderFilter = new PIXI.Filter({
        glProgram: new PIXI.GlProgram({ 
            vertex: vertexShader, 
            fragment: fragmentShader, 
            }),
        resources: {
            backgroundUniforms: {
                uTime: {value: 0.0, type: 'f32'},
                uSun: { value: [0.75, 0.75], type: 'vec2<f32>' },
                uRectPos: { value: [0,  0], type: 'vec2<f32>' },   
                uResolution: { value: [1238, 860], type: 'vec2<f32>' },
            }
        }
    });

    blurSprite.filters = [new PIXI.BlurFilter()]
    blurRect.filters = [new PIXI.BlurFilter()]

    //terrainRect.filters = [shaderFilter]
   //terrainSprite.filters = [shaderFilter]

    container.addChild(normalRect)
    container.addChild(blurRect)
    container.addChild(terrainRect)
    
    container.addChild(normalSprite)
    container.addChild(blurSprite)
    container.addChild(terrainSprite)
    return container
}

async function initGame() {
        
    const backgroundVertexShader = await loadShader('../gfx/terrain.vert')
    const backgroundFragmentShader = await loadShader('../gfx/terrain.frag')
    const textureBTC = await PIXI.Assets.load({src: '../gfx/btc.png'})

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
    const terrain = createTerrain(app, backgroundVertexShader, backgroundFragmentShader, textureBTC);
    containerTerrain.addChildAt(terrain,0);

}


window.addEventListener("load", (event) => {
    initGame();
})