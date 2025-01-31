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

function createStockBottomLines(dataPoints, lineWidth, coin) {
    const prices = []
    const vertices = []
    const indices = []
    const colors = []
    const pointIndices = []

    for (let i = dataPoints.length-1; i >= 0; i--) {
       
        const currentY = dataPoints[i].price || 0;
        const x = i* lineWidth;

        prices.push(currentY)
        prices.push(currentY)

        vertices.push(         
            x, 0,  
            x, currentY  
        );

        for (let h = 0; h < 2; h++) {
            pointIndices.push(i)
        }

        // Bestimme die Farbe: Grün (Aufwärts) oder Rot (Abwärts)
        const color = hexToRGB('#4d4d4d', 1.0)

        for (let j = 0; j < 4; j++) {
            colors.push(...color);
        }
    }

    return { prices: new Float32Array(prices), vertices: new Float32Array(vertices), colors: colors, pointIndices: new Float32Array(pointIndices) };

}

function updateGraph(graph, app,currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, stopIndex, coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options, yourCoinName, isMenuVisible, ownPriceData, sunPos, color) {
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
   // const percentage = calculatePriceChange(price, lastPrice)
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

    


    var scaleY = -app.renderer.height*gscale/(maxPrice-minPrice)

    graph.parsedData = parsedData
    graph.maxVisiblePoints = maxVisiblePoints
    graph.stepX = stepX
    graph.app = app
    graph.currentIndexInteger = currentIndexInteger
    graph.diffCurrentIndexIntToFloat = diffCurrentIndexIntToFloat
    graph.scaleY = scaleY
    graph.price = price
    graph.minPrice = minPrice
    graph.maxPrice = maxPrice
    
    graph.curveBottom.position.set(- (currentIndexInteger-maxVisiblePoints+1)*stepX, app.renderer.height*gscalebg-minPrice*scaleY);
    graph.curveBottom.scale.set(stepX, scaleY);
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = isMenuVisible ? 10000 : maxVisiblePoints
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uSun = [(sunPos.x)/app.screen.width-0.5,0.5-(sunPos.y)/app.screen.height]
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uR = color[0];
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uG = color[1];
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uB = color[2];
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uA = color[3];
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uCurrentIndex = currentIndexInteger
 
    const positions = graph.meshOwnLines.geometry.getAttribute('aPosition').buffer;
    const d = positions.data
    let heightHalf = stepX/scaleY
    for(let i=0;i<parsedData.length-1;i++) {
        const ix = i*8
        let y = parsedData[i].price || 0;

        if (i > options.indexEnd || i < options.indexStart || isFinalScreen) {
            d[ix + 1] = -100
            d[ix + 3] = -100
            d[ix + 5] = -100
            d[ix + 7] = -100
        } else {
            d[ix + 1] = y - heightHalf
            d[ix + 3] = y + heightHalf
            d[ix + 5] = y + heightHalf
            d[ix + 7] = y-heightHalf;
        }



    }
    let realTrades = trades.filter((trade,i) => ((i === 0 || trade.fromName !== trade.toName) && (trade.toName === fiatName || trade.fromName === fiatName)))
    
    
    realTrades.forEach((trade, i) => {
        if (trade.toName === fiatName) {
            let toIndex = i < realTrades.length-1 ? realTrades[i+1].index : options.indexEnd-1
            let y = trade.fromName !== fiatName ? trade.fromPrice : trade.fromCoins;
            for(let i=trade.index;i<toIndex;i++) {
                const ix = i*8
                d[ix + 1] = y - heightHalf
                d[ix + 3] = y + heightHalf
                d[ix + 5] = y + heightHalf
                d[ix + 7] = y-heightHalf;
            }
        }
    })


    positions.update()

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
    graph.curveBottom.shader.resources.graphUniforms.uniforms.uAlpha = graph.alpha


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
 
    trades.filter((trade,i) => (i === 0 || trade.fromName === graph.coinName || trade.toName === graph.coinName)).forEach((trade,i) => {
        trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
        trade.container.y = app.renderer.height*gscalebg-  
        ((trade.fromName !== fiatName ? trade.fromPrice : (i === 0 ? trade.fromCoins : trade.toPrice))-minPrice)/(maxPrice-minPrice)*app.renderer.height*gscale;
  
        if (trade.sprite) {
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.02
        }
        
        if (trade.labelPrice) {
            if (trade.index > currentIndexInteger - maxVisiblePoints) {  
                trade.labelPrice.position.set(trade.labelPrice.width*0.5,0) 
            } else {
                trade.labelPrice.position.set(0,0)
            }
            trade.labelPrice.visible = false
            trade.labelPrice.scale = SCALE_TEXT_BASE
        }
     

        if (trade.labelPercentage) { 
            trade.labelPercentage.scale = 0.6
            trade.labelPercentage.y = trade.tradeBefore.container.y - trade.container.y-10
            trade.labelPercentage.x = (trade.tradeBefore.container.x - trade.container.x)*0.5
        }

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
    let ownLines = createOwnLines(parsedData,1, coins[coinName])
    let linesBottom = createStockBottomLines(parsedData, 1, coins[coinName])
   

    const geometryOwnLines = new PIXI.Geometry({
        attributes: {
            aPosition: ownLines.vertices,
            aIndex: ownLines.pointIndices,
            aUV: ownLines.uv
        },
        indexBuffer: ownLines.indices,
        topology: 'triangle-list'
    });

   
    const geometryLinesBottom = new PIXI.Geometry({
        attributes: {
            aPosition: linesBottom.vertices,
            aColor: linesBottom.colors,
            aIndex: linesBottom.pointIndices,
        },
        topology: 'triangle-strip'
    });

    geometryLinesBottom.addAttribute('aPrice', linesBottom.prices, 1)

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
                uSun: { value: [1.0, 1.0], type: 'vec2<f32>' },
                uR: {type: 'f32', value: 0.0},
                uG: {type: 'f32', value: 0.0},
                uB: {type: 'f32', value: 0.0},
                uA: {type: 'f32', value: 0.0},
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
                uMaxVisiblePoints: {type: 'i32', value: 3},
                uScale: { value: [1.0, 1.0], type: 'vec2<f32>' }
            }
        }
    });

    const graph = new PIXI.Container()

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

    const logo = new PIXI.Container()
    const logoSprite = new PIXI.Sprite(coins[coinName].texture);
    logo.addChild(logoSprite)
    logoSprite.anchor.set(1,0.5)
    logoSprite.scale.set(0.001,0.001)        

    graphLinesBottomMesh.state.culling = true;
    graphOwnLinesMesh.state.culling = false;

    graph.addChild(graphLinesBottomMesh)
    graph.addChild(graphOwnLinesMesh)

    graph.addChild(logo);
    graph.curveBottom = graphLinesBottomMesh
    graph.meshOwnLines = graphOwnLinesMesh
    graph.logo = logo
    graph.logoSprite = logoSprite

    graph.priceLabel = new PIXI.Text({text: "", style: textStyle});
    graph.addChild(graph.priceLabel);
    graph.priceLabel.visible = false
    graph.priceLabel.anchor.set(10.5,0.5)
    graph.priceLabel.yOriginal = 0
    

    graph.maxPriceLabel = new PIXI.Text({text: "", style: textStyle});
    graph.addChild(graph.maxPriceLabel);
    graph.maxPriceLabel.visible = false
    graph.maxPriceLabel.anchor.set(1,1)

    graph.minPriceLabel = new PIXI.Text({text: "", style: textStyle});
    graph.addChild(graph.minPriceLabel);
    graph.minPriceLabel.visible = false
    graph.minPriceLabel.anchor.set(1,0)

    graph.coinName = coinName

    return graph
}


function getGraphXYForIndexAndPrice (graph, index, price = null) {
    if (price === null) {
        price = graph.price
    }
    let result = {x: 0, y:0}
    result.x =  (index - (graph.currentIndexInteger-graph.maxVisiblePoints+2+graph.diffCurrentIndexIntToFloat)) * graph.stepX;
    result.y = graph.app.renderer.height*gscalebg-(price-graph.minPrice)/(graph.maxPrice-graph.minPrice)*graph.app.renderer.height*gscale;
    return result
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
                uSun: { value: [1.0, 1.0], type: 'vec2<f32>' },
                uResolution: { value: [1.0, 1.0], type: 'vec2<f32>' },
                uMenuTop: { value: [1.0, 1.0], type: 'vec2<f32>' },
            }
        }
    });

    const graph = new PIXI.Mesh({
        geometry,
        shader
    });
    return graph
}