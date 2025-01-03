async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}


function createStockLines(dataPoints, lineWidth, coin) {
    const vertices = []
    const indices = []
    const colors = []
    const pointIndices = []

    for (let i = 1; i < dataPoints.length; i++) {
        const prevY = dataPoints[i - 1].price || 0;
        const currentY = dataPoints[i].price || 0;
        const x = (i - 1) * lineWidth;
        const prevX = (i - 2) * lineWidth;
        const halfWidth = lineWidth * 0.25

        // Punkte für Triangle Strip: P1, P2, P3, P4
        vertices.push(
            prevX-halfWidth, prevY,                  // P1: Unten links
            x-halfWidth, currentY,               // P2: Oben links
            prevX+halfWidth, prevY,      // P3: Unten rechts
            x+halfWidth, currentY    // P4: Oben rechts
        );
        for (let h = 0; h < 4; h++) {
            pointIndices.push(i-1)
        }


       
        if (currentY < prevY) {
            indices.push(4*(i - 1)+0); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+3); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+1); 
        } else {
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+0); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+3); 
        }
       
        

        // Bestimme die Farbe: Grün (Aufwärts) oder Rot (Abwärts)
        const color = currentY < prevY 
            ? hexToRGB(coin.color, 1.0).map((e,i) => e*0.5) // Rot (RGBA: 1, 0, 0, 1)
            : hexToRGB(coin.color, 1.0); // Grün (RGBA: 0, 1, 0, 1)

        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}


function createStockRectangles(dataPoints, rectWidth) {
    const vertices = []
    const indices = []
    const colors = []
    const pointIndices = []

    for (let i = 1; i < dataPoints.length; i++) {
        const prevY = dataPoints[i - 1].price;
        const currentY = dataPoints[i].price;
        const x = (i - 1) * rectWidth;
        const halfWidth = rectWidth * 0.5
        // Punkte für Triangle Strip: P1, P2, P3, P4
        vertices.push(
            x-halfWidth, prevY,                  // P1: Unten links
            x-halfWidth, currentY,               // P2: Oben links
            x+halfWidth, prevY,      // P3: Unten rechts
            x+halfWidth, currentY    // P4: Oben rechts
        );
        for (let h = 0; h < 4; h++) {
            pointIndices.push(i-1)
        }

        if (currentY < prevY) {
            indices.push(4*(i - 1)+0); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+3); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+1); 
        } else {
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+0); 
            indices.push(4*(i - 1)+1); 
            indices.push(4*(i - 1)+2); 
            indices.push(4*(i - 1)+3);      
        }
       
        

        // Bestimme die Farbe: Grün (Aufwärts) oder Rot (Abwärts)
        const color = currentY < prevY 
            ? [1.0, 0.0, 0.0, 1.0] // Rot (RGBA: 1, 0, 0, 1)
            : [0.0, 1.0, 0.0, 1.0]; // Grün (RGBA: 0, 1, 0, 1)

        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}

function updateGraph(graph, app,currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, stopIndex, coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options) {
    let parsedData = coins[graph.coinName].data
    let maxPrice = parsedData[currentIndexInteger].price
    let minPrice = parsedData[currentIndexInteger].price
    let maxPriceIndex = currentIndexInteger
    let minPriceIndex = currentIndexInteger
    const price = parsedData[currentIndexInteger].price
    const pricePriorIndex = currentIndexInteger > 0 ? parsedData[currentIndexInteger-1].price : price
    const priceNextIndex = currentIndexInteger+1 < parsedData.length ? parsedData[currentIndexInteger+1].price : price
    const lastPriceIndex = trades.length > 0 ? trades[trades.length-1].index : (currentIndexInteger-maxVisiblePoints > 0 ? currentIndexInteger-maxVisiblePoints : 0)
    const lastPrice = parsedData[lastPriceIndex].price || price
    const percentage = calculatePriceChange(price, lastPrice)
    let percentageText = percentage.text
    let percentageColor = percentage.color
    for (let i = currentIndexInteger-maxVisiblePoints+1; i < currentIndexInteger; i++) {
        if (i >= 0) {
            if (parsedData[i].price > maxPrice) {
                maxPrice = parsedData[i].price
                maxPriceIndex = i
            }

            if (parsedData[i].price < minPrice) {
                minPrice = parsedData[i].price
                minPriceIndex = i
            }
        }
    }

    if (maxPrice === minPrice) {
        maxPrice=Math.max(100, parsedData[currentIndexInteger].price*2)
        minPrice=0
    }

    var scaleY = -app.renderer.height*0.8/(maxPrice-minPrice)
    
    if (graph.coinName === 'BTC') {
        graph.curve = graph.meshRects
        graph.meshLines.visible = false
        graph.curve.visible = true
    } else {
        graph.curve = graph.meshLines
        graph.meshRects.visible = false
        graph.curve.visible = true
    }
  

    graph.curve.position.set(- (currentIndexInteger-maxVisiblePoints+1)*stepX, app.renderer.height*0.9-minPrice*scaleY);
    graph.curve.scale.set(stepX, scaleY);
    graph.curve.shader.resources.graphUniforms.uniforms.uCurrentIndex = currentIndexInteger
    graph.curve.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = maxVisiblePoints
    graph.logo.x = (1.0-diffCurrentIndexIntToFloat)*((currentIndexInteger - (currentIndexInteger-maxVisiblePoints+2)) * stepX) + (diffCurrentIndexIntToFloat)*(((currentIndexInteger+1) - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
    graph.logo.y = (1.0-diffCurrentIndexIntToFloat)*(app.renderer.height*0.9-(price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8) + (diffCurrentIndexIntToFloat)*(app.renderer.height*0.9-(pricePriorIndex-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8);
    if (price <= 0) {
        graph.logo.y = -100
    }
    graph.logoSprite.height = graph.logoSprite.width = app.renderer.width*0.04
    graph.alpha = options.coinNames.length < 3 || focusedCoinName === fiatName || !focusedCoinName || focusedCoinName === graph.coinName ? 1.0 : 0.0
    graph.curve.shader.resources.graphUniforms.uniforms.uAlpha = graph.alpha



    graph.priceLabel.text = formatCurrency(price, fiatName,null, true)
       
    if (isStopScreen && !isFinalScreen) {
        graph.priceLabel.x = 0.9*graph.priceLabel.x +0.1*((currentIndexInteger - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
        graph.priceLabel.y = 0.9*graph.priceLabel.y +0.1*(app.renderer.height*0.9-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8);
        graph.priceLabel.y = Math.min(app.renderer.height-graph.priceLabel.height*(1-graph.priceLabel.anchor.y), Math.max(graph.priceLabel.y, app.renderer.height*0.1+graph.priceLabel.height*graph.priceLabel.anchor.y))
        graph.priceLabel.x = Math.min(app.renderer.width-graph.priceLabel.width*(1-graph.priceLabel.anchor.x), Math.max(graph.priceLabel.x, -graph.priceLabel.width*(graph.priceLabel.anchor.x)))
        graph.priceLabel.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = options.coinNames.length < 3 || focusedCoinName === graph.coinName

        graph.maxPriceLabel.x = 0.9*graph.maxPriceLabel.x +0.1*((maxPriceIndex - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
        graph.maxPriceLabel.y = 0.9*graph.maxPriceLabel.y +0.1*(app.renderer.height*0.9-  (parsedData[maxPriceIndex].price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8);
        graph.maxPriceLabel.text = "Max:\n" + formatCurrency(parsedData[maxPriceIndex].price, fiatName,null, true) 
        graph.maxPriceLabel.y = Math.min(app.renderer.height*0.7-graph.maxPriceLabel.height*(1-graph.maxPriceLabel.anchor.y), Math.max(graph.maxPriceLabel.y, app.renderer.height*0.2+graph.maxPriceLabel.height*graph.maxPriceLabel.anchor.y))
        graph.maxPriceLabel.x = Math.min(graph.priceLabel.x-graph.maxPriceLabel.width*(1-graph.maxPriceLabel.anchor.x), Math.max(graph.maxPriceLabel.x, app.renderer.width*0.2-graph.maxPriceLabel.width*(graph.maxPriceLabel.anchor.x)))
        
        graph.minPriceLabel.x = 0.9*graph.minPriceLabel.x +0.1*((minPriceIndex - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
        graph.minPriceLabel.y = 0.9*graph.minPriceLabel.y +0.1*(app.renderer.height*0.9-  (parsedData[minPriceIndex].price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8);
        graph.minPriceLabel.text = "Min:\n" + formatCurrency(parsedData[minPriceIndex].price, fiatName,null, true) 
        graph.minPriceLabel.y = Math.min(app.renderer.height*0.7-graph.minPriceLabel.height*(1-graph.minPriceLabel.anchor.y), Math.max(graph.minPriceLabel.y, app.renderer.height*0.2+graph.minPriceLabel.height*graph.minPriceLabel.anchor.y))
        graph.minPriceLabel.x = Math.min(graph.priceLabel.x-graph.minPriceLabel.width*(1-graph.minPriceLabel.anchor.x), Math.max(graph.minPriceLabel.x, app.renderer.width*0.2-graph.minPriceLabel.width*(graph.minPriceLabel.anchor.x)))
        
        if (minPriceIndex === maxPriceIndex || stopIndex === 0) {
           graph.minPriceLabel.visible = graph.maxPriceLabel.visible = false
           graph.priceLabel.text = formatCurrency(price, fiatName,null, true)
        } 
    } else if (isFinalScreen) {
        graph.priceLabel.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = false
    } else {
        graph.maxPriceLabel.visible = graph.minPriceLabel.visible = false
        graph.priceLabel.visible = options.coinNames.length < 3 || focusedCoinName === graph.coinName
        graph.priceLabel.x = 0.9*graph.priceLabel.x +0.1*((currentIndexInteger - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
        graph.priceLabel.y = 0.9*graph.priceLabel.y +0.1*(app.renderer.height*0.9-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8);
        graph.priceLabel.y = Math.min(app.renderer.height-graph.priceLabel.height*(1-graph.priceLabel.anchor.y), Math.max(graph.priceLabel.y, app.renderer.height*0.1+graph.priceLabel.height*graph.priceLabel.anchor.y))
        graph.priceLabel.x = Math.min(app.renderer.width-graph.priceLabel.width*(1-graph.priceLabel.anchor.x), Math.max(graph.priceLabel.x, -graph.priceLabel.width*(graph.priceLabel.anchor.x)))
        

    }


    trades.filter(trade => (trade.fromName === graph.coinName || trade.toName === graph.coinName)).forEach((trade) => {
        trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
        trade.container.y = app.renderer.height*0.9-  ((trade.fromName === graph.coinName ? trade.fromPrice : trade.toPrice)-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
        if (trade.sprite) {
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.04
        }
        
        if (trade.index > currentIndexInteger - maxVisiblePoints) {  
            trade.labelPrice.position.set(trade.labelPrice.width*0.5,0) 
        } else {
            trade.labelPrice.position.set(0,0)
        }

        trade.container.visible = options.coinNames.length < 3 || !focusedCoinName || focusedCoinName === graph.coinName
     })


    return {
        maxPrice: maxPrice,
        minPrice: minPrice
    }

}

function createGraph(coinName, graphVertexShader, graphFragmentShader, coins, textStyle) {
    
    let parsedData = coins[coinName].data

    let rects = createStockRectangles(parsedData,1)
    let lines = createStockLines(parsedData,1, coins[coinName])

    const geometryRects = new PIXI.Geometry({
        attributes: {
            aPosition: rects.vertices,
            aColor: rects.colors,
            aIndex: rects.pointIndices
        },
        indexBuffer: rects.indices
    });

    const geometryLines = new PIXI.Geometry({
        attributes: {
            aPosition: lines.vertices,
            aColor: lines.colors,
            aIndex: lines.pointIndices
        },
        indexBuffer: lines.indices
    });


    const shader = new PIXI.Shader({
        glProgram: new PIXI.GlProgram({ 
            vertex: graphVertexShader, 
            fragment: graphFragmentShader, 
            }),
        resources: {
            graphUniforms: {
                uCurrentIndex: {type: 'i32', value: 0},
                uAlpha: {type: 'f32', value: 1.0},
                uMaxVisiblePoints: {type: 'i32', value: 3},
                uScale: { value: [1.0, 1.0], type: 'vec2<f32>' },
            }
        }
    });

    const graph = new PIXI.Container()

    const graphRectsMesh = new PIXI.Mesh({
        geometry: geometryRects,
        shader
    });

    const graphLinesMesh = new PIXI.Mesh({
        geometry: geometryLines,
        shader
    });


    const logo = new PIXI.Container()
    const logoSprite = new PIXI.Sprite(coins[coinName].texture);
    logo.addChild(logoSprite)
    logoSprite.anchor.set(0.5,0.5)
    logoSprite.scale.set(0.001,0.001)        

    graphRectsMesh.state.culling = true;
    graphLinesMesh.state.culling = true;
    graph.addChild(graphRectsMesh)
    graph.addChild(graphLinesMesh)
    graph.addChild(logo);
    graph.curve = graphLinesMesh
    graph.meshRects = graphRectsMesh
    graph.meshLines = graphLinesMesh
    graph.logo = logo
    graph.logoSprite = logoSprite


    graph.priceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.priceLabel);
    graph.priceLabel.visible = false
    graph.priceLabel.anchor.set(0,1.5)

    graph.maxPriceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.maxPriceLabel);
    graph.maxPriceLabel.visible = false
    graph.maxPriceLabel.anchor.set(0,1.5)

    graph.minPriceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.minPriceLabel);
    graph.minPriceLabel.visible = false
    graph.minPriceLabel.anchor.set(0,1.5)

    graph.coinName = coinName
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
                uColor: {type: 'vec4<f32>', value: new Float32Array([1.0,0.0,0.0,1.0])},
                uThreshold: {type: 'f32', value: 0.05},
                uTime: {type: 'f32', value: 0.0},
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
         