async function loadShader(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Fehler beim Laden von ${url}: ${response.statusText}`);
    }
    return response.text(); // Shader als Text zurückgeben
}


function createOwnLines(dataPoints, lineWidth, coin) {
    const vertices = []
    const indices = []
    const colors = []
    const pointIndices = []
    const uvs = []

    for (let i = 0; i < dataPoints.length; i++) {
        const y = dataPoints[i].price || 0;
        const x = (i-1) * lineWidth;
        const halfWidth = 0.5*lineWidth
        // Punkte für Triangle Strip: P1, P2, P3, P4
        vertices.push(
            x-halfWidth, y,                  // P1: Unten links
            x-halfWidth, y+lineWidth,               // P2: Oben links
            x-halfWidth+lineWidth*2, y+lineWidth,      // P3: Unten rechts
            x-halfWidth+lineWidth*2, y    // P4: Oben rechts
        );

        uvs.push(0,0)
        uvs.push(0,1)
        uvs.push(1,1)
        uvs.push(1,0)
   
        for (let h = 0; h < 4; h++) {
            pointIndices.push(i)
        }

        indices.push(4*i+0); 
        indices.push(4*i+2); 
        indices.push(4*i+1); 
        indices.push(4*i+0); 
        indices.push(4*i+3); 
        indices.push(4*i+2); 
        
        // Bestimme die Farbe: Grün (Aufwärts) oder Rot (Abwärts)
        const color = hexToRGB('#ffffff', 0.5)
        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices), uv: new Float32Array(uvs) };

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
        const halfWidth = lineWidth * 0.5

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
        const color = hexToRGB('#ffffff', 1.0)
        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}


function createStockBottomLines(dataPoints, lineWidth, coin) {
    const vertices = []
    const indices = []
    const colors = []
    const pointIndices = []

    for (let i = 1; i < dataPoints.length; i++) {
        const prevY = dataPoints[i - 1].price || 0;
        const currentY = dataPoints[i].price || 0;
        const x = (i - 1) * lineWidth;
        const prevX = (i - 2) * lineWidth;
        const halfWidth = lineWidth * 0.5

        // Punkte für Triangle Strip: P1, P2, P3, P4
        vertices.push(
            prevX+halfWidth, prevY,                  // P1: Unten links
            x+halfWidth, currentY,               // P2: Oben links
            prevX+halfWidth, 0,      // P3: Unten rechts
            x+halfWidth, 0    // P4: Oben rechts
        );
        for (let h = 0; h < 4; h++) {
            pointIndices.push(i-1)
        }


       

        indices.push(4*(i - 1)+2); 
        indices.push(4*(i - 1)+1); 
        indices.push(4*(i - 1)+0); 
        indices.push(4*(i - 1)+1); 
        indices.push(4*(i - 1)+2); 
        indices.push(4*(i - 1)+3); 
        
       
        

        // Bestimme die Farbe: Grün (Aufwärts) oder Rot (Abwärts)
        const color = hexToRGB('#4d4d4d', 1.0)

        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}


function createStockBottomRectangles(dataPoints, rectWidth) {
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
        const lowerY = prevY < currentY ? prevY : currentY
        vertices.push(
            x-halfWidth, 0,                  // P1: Unten links
            x-halfWidth, lowerY,               // P2: Oben links
            x+halfWidth, 0,      // P3: Unten rechts
            x+halfWidth, lowerY    // P4: Oben rechts
        );
        for (let h = 0; h < 4; h++) {
            pointIndices.push(i-1)
        }

        indices.push(4*(i - 1)+2); 
        indices.push(4*(i - 1)+1); 
        indices.push(4*(i - 1)+0); 
        indices.push(4*(i - 1)+1); 
        indices.push(4*(i - 1)+2); 
        indices.push(4*(i - 1)+3);     
       
        const color = hexToRGB('#4d4d4d', 1.0)

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
            ? [1.0,1.0,1.0, 1.0] // Rot (RGBA: 1, 0, 0, 1)
            : [1.0,1.0,1.0, 1.0]; // Grün (RGBA: 0, 1, 0, 1)

        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { vertices: new Float32Array(vertices), indices: new Int32Array(indices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}

function updateGraph(graph, app,currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, stopIndex, coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options, yourCoinName, isMenuVisible, ownPriceData) {
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
    for (let i = currentIndexInteger-maxVisiblePoints+1-100; i < currentIndexInteger; i++) {
        if (i >= 0 && 1 <= parsedData.length) {
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

    var scaleY = -app.renderer.height*gscale/(maxPrice-minPrice)
    
    if (graph.coinName === 'BTC2') {
        graph.curve = graph.meshRects
        graph.curveBottom = graph.meshRectsBottom
        graph.meshLines.visible = false
        graph.meshLinesBottom.visible =false
        graph.meshOwnLines.visible = false
        graph.curve.visible = true
    } else {
        graph.curve = graph.meshLines
        graph.curveBottom = graph.meshLinesBottom
        graph.meshRects.visible = false
        graph.meshRectsBottom.visible = false
    }

    graph.curve.visible = true
    graph.curveBottom.visible = true
    graph.curveBottom.position.set(- (currentIndexInteger-maxVisiblePoints+1)*stepX, app.renderer.height*gscalebg-minPrice*scaleY);
    graph.curveBottom.scale.set(stepX, scaleY);
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uCurrentIndex = 0
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = isMenuVisible ? 10000 : maxVisiblePoints

    const positions = graph.meshOwnLines.geometry.getAttribute('aPosition').buffer;
    const d = positions.data
    let heightHalf = stepX/scaleY
    for(let i=0;i<parsedData.length-1;i++) {
        const ix = i*8
        let y = parsedData[i].price || 0;
        d[ix + 1] = -100
        d[ix + 3] =-100
        d[ix + 5] = -100
        d[ix + 7] = -100
    }
    let realTrades = trades.filter(trade => (trade.fromName !== trade.toName && (trade.toName === fiatName || trade.fromName === fiatName)))
    realTrades.forEach((trade, i) => {
        if (trade.toName === fiatName) {
            let toIndex = i < realTrades.length-1 ? realTrades[i+1].index : parsedData.length-1
            
            let y = trade.fromPrice;
            let y2 = i < realTrades.length-1 ? realTrades[i+1].toPrice : parsedData[parsedData.length-1].price

            for(let i=trade.index;i<=toIndex;i++) {
                const ix = i*8
                d[ix + 1] = y - heightHalf
                d[ix + 3] = y + heightHalf
                d[ix + 5] = y + heightHalf
                d[ix + 7] = y-heightHalf;
            }
           

        }
    })


    positions.update()

    graph.curve.position.set(- (currentIndexInteger-maxVisiblePoints+1)*stepX, app.renderer.height*gscalebg-minPrice*scaleY);
    graph.curve.scale.set(stepX, scaleY);
    graph.curve.shader.resources.graphUniforms.uniforms.uCurrentIndex = currentIndexInteger
    graph.curve.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = isMenuVisible ? 10000 : maxVisiblePoints
    
    graph.meshOwnLines.position.set(- (currentIndexInteger-maxVisiblePoints+1)*stepX, app.renderer.height*gscalebg-minPrice*scaleY);
    graph.meshOwnLines.scale.set(1, 1);
    graph.meshOwnLines.shader.resources.graphUniforms.uniforms.uCurrentIndex = currentIndexInteger
    graph.meshOwnLines.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = isMenuVisible ? 10000 : maxVisiblePoints
    graph.meshOwnLines.shader.resources.graphUniforms.uniforms.uScale = [stepX,scaleY]
    
    
    graph.logo.x = (1.0-diffCurrentIndexIntToFloat)*((currentIndexInteger - (currentIndexInteger-maxVisiblePoints+2)) * stepX) + (diffCurrentIndexIntToFloat)*(((currentIndexInteger+1) - (currentIndexInteger-maxVisiblePoints+2)) * stepX);
    graph.logo.y = (1.0-diffCurrentIndexIntToFloat)*(app.renderer.height*gscalebg-(price-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale) + (diffCurrentIndexIntToFloat)*(app.renderer.height*gscalebg-(pricePriorIndex-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale);
    if (price <= 0) {
        graph.logo.y = -100
    }
    graph.logoSprite.height = graph.logoSprite.width = app.renderer.width*0.04
    graph.alpha = options.coinNames.length < 3 || focusedCoinName === fiatName || !focusedCoinName || focusedCoinName === graph.coinName ? 1.0 : 0.0
    graph.curve.shader.resources.graphUniforms.uniforms.uAlpha = graph.alpha


    graph.priceLabel.text = formatCurrency(price, fiatName,null, true)
    graph.maxPriceLabel.x  = graph.minPriceLabel.x  = graph.priceLabel.x = app.screen.width + diffCurrentIndexIntToFloat*stepX;
    graph.priceLabel.y = 0.9*graph.priceLabel.y +0.1*(app.renderer.height*gscalebg-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale);
    graph.minPriceLabel.y = app.renderer.height*gscalebg;
    graph.maxPriceLabel.y = app.renderer.height*gscalet;
    graph.maxPriceLabel.text = formatCurrency(parsedData[maxPriceIndex].price, fiatName,null, true) 
    graph.minPriceLabel.text = formatCurrency(parsedData[minPriceIndex].price, fiatName,null, true) 
   

    graph.maxPriceLabel.x  = graph.minPriceLabel.x  = graph.priceLabel.x =  graph.logo.x
    graph.priceLabel.yOriginal =0.9*graph.priceLabel.yOriginal+ 0.1*(app.renderer.height*gscalebg-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale)
    graph.priceLabel.y = Math.min(graph.minPriceLabel.y - graph.minPriceLabel.height*2, Math.max(graph.priceLabel.y, graph.maxPriceLabel.y + graph.minPriceLabel.height*2))
    if (isStopScreen && !isFinalScreen) {
        graph.priceLabel.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = options.coinNames.length < 3 || focusedCoinName === graph.coinName
       
        if (minPriceIndex === maxPriceIndex || stopIndex === 0) {
            graph.priceLabel.text = formatCurrency(price, fiatName,null, true)
        } 
    } else if (isFinalScreen) {
        graph.priceLabel.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = false
    } else {
        graph.priceLabel.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = options.coinNames.length < 3 || focusedCoinName === graph.coinName

    }



    graph.priceLabel.scale  = 8*SCALE_TEXT_BASE
    graph.maxPriceLabel.scale = graph.minPriceLabel.scale = 8*SCALE_TEXT_BASE * 0.75

    //graph.logoSprite.visible = isStopScreen || yourCoinName === graph.coinName
 
    trades.filter(trade => (trade.fromName === graph.coinName || trade.toName === graph.coinName)).forEach((trade) => {
        trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
        trade.container.y = app.renderer.height*gscalebg-  ((trade.fromName === graph.coinName ? trade.fromPrice : trade.toPrice)-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale;
        if (trade.sprite) {
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.02
        }
        
        if (trade.index > currentIndexInteger - maxVisiblePoints) {  
            trade.labelPrice.position.set(trade.labelPrice.width*0.5,0) 
        } else {
            trade.labelPrice.position.set(0,0)
        }

        trade.labelPrice.visible = false

        trade.labelPrice.scale = SCALE_TEXT_BASE


        trade.container.visible = options.coinNames.length < 3 || !focusedCoinName || focusedCoinName === graph.coinName
     })

     if (isMenuVisible) {
        graph.logoSprite.visible = false
        graph.maxPriceLabel.visible = graph.minPriceLabel.visible = graph.priceLabel.visible = false
        trades.forEach(trade => {
            trade.container.visible = false
        })
    }
    graph.logoSprite.visible = graph.maxPriceLabel.visible = graph.minPriceLabel.visible = graph.priceLabel.visible = false

    graph.stepX = stepX
    graph.scaleY = scaleY

    return {
        maxPrice: maxPrice,
        minPrice: minPrice,
        price: price
    }

}

function createGraph(coinName, graphVertexShader, graphFragmentShader, coins, textStyle, ownVertexShader, ownFragmentShader,textureCloud) {
    
    let parsedData = coins[coinName].data

    let rects = createStockRectangles(parsedData,1)
    let lines = createStockLines(parsedData,1, coins[coinName])
    let ownLines = createOwnLines(parsedData,1, coins[coinName])
    let linesBottom = createStockBottomLines(parsedData, 1, coins[coinName])
    let rectsBottom = createStockBottomRectangles(parsedData, 1, coins[coinName])

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

    const geometryOwnLines = new PIXI.Geometry({
        attributes: {
            aPosition: ownLines.vertices,
            aColor: ownLines.colors,
            aIndex: ownLines.pointIndices,
            aUV: ownLines.uv
        },
        indexBuffer: ownLines.indices
    });

   
    const geometryLinesBottom = new PIXI.Geometry({
        attributes: {
            aPosition: linesBottom.vertices,
            aColor: linesBottom.colors,
            aIndex: linesBottom.pointIndices
        },
        indexBuffer: linesBottom.indices
    });

    
    const geometryRectsBottom = new PIXI.Geometry({
        attributes: {
            aPosition: rectsBottom.vertices,
            aColor: rectsBottom.colors,
            aIndex: rectsBottom.pointIndices
        },
        indexBuffer: rectsBottom.indices
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

    const ownShader = new PIXI.Shader({
        glProgram: new PIXI.GlProgram({ 
            vertex: ownVertexShader, 
            fragment: ownFragmentShader, 
            }),
        resources: {
            uTexture: textureCloud.source,
            graphUniforms: {
                uCurrentIndex: {type: 'i32', value: 0},
                uAlpha: {type: 'f32', value: 1.0},
                uMaxVisiblePoints: {type: 'i32', value: 3},
                uScale: { value: [1.0, 1.0], type: 'vec2<f32>' }
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

    const graphOwnLinesMesh = new PIXI.Mesh({
        geometry: geometryOwnLines,
        shader: ownShader,
        texture: textureCloud,
        blendMode: 'screen'
    });

    const graphLinesBottomMesh = new PIXI.Mesh({
        geometry: geometryLinesBottom,
        shader
    });

    const graphRectsBottomMesh = new PIXI.Mesh({
        geometry: geometryRectsBottom,
        shader
    });


    const logo = new PIXI.Container()
    const logoSprite = new PIXI.Sprite(coins[coinName].texture);
    logo.addChild(logoSprite)
    logoSprite.anchor.set(1,0.5)
    logoSprite.scale.set(0.001,0.001)        

    graphRectsMesh.state.culling = true;
    graphLinesMesh.state.culling = true;
    graphLinesBottomMesh.state.culling = true;
    graphRectsBottomMesh.state.culling = true;
    graphOwnLinesMesh.state.culling = false;

    graph.addChild(graphRectsMesh)
    graph.addChild(graphLinesBottomMesh)
    graph.addChild(graphRectsBottomMesh)
    graph.addChild(graphLinesMesh)
    graph.addChild(graphOwnLinesMesh)

    graph.addChild(logo);
    graph.curve = graphLinesMesh
    graph.curveBottom = graphLinesBottomMesh
    graph.meshRects = graphRectsMesh
    graph.meshLines = graphLinesMesh
    graph.meshOwnLines = graphOwnLinesMesh
    graph.meshLinesBottom = graphLinesBottomMesh
    graph.meshRectsBottom = graphRectsBottomMesh
    graph.logo = logo
    graph.logoSprite = logoSprite

    graph.priceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.priceLabel);
    graph.priceLabel.visible = false
    graph.priceLabel.anchor.set(10.5,0.5)
    graph.priceLabel.yOriginal = 0
    

    graph.maxPriceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.maxPriceLabel);
    graph.maxPriceLabel.visible = false
    graph.maxPriceLabel.anchor.set(1,1)

    graph.minPriceLabel = new PIXI.Text("", textStyle);
    graph.addChild(graph.minPriceLabel);
    graph.minPriceLabel.visible = false
    graph.minPriceLabel.anchor.set(1,0)

    graph.coinName = coinName
    return graph
}

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
                uR: {type: 'f32', value: 0.0},
                uG: {type: 'f32', value: 0.0},
                uB: {type: 'f32', value: 0.0},
                uA: {type: 'f32', value: 0.0},
                uThreshold: {type: 'f32', value: 0.05},
                uTime: {type: 'f32', value: 0.0},
                uCurveStrength: {type: 'f32', value: 1.5},
                uPercentage: {type: 'f32', value: 0.5},
            }
        }
    });

    const graph = new PIXI.Mesh({
        geometry,
        shader
    });
    return graph
}
         