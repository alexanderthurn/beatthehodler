// Funktion, um den Graphen mit Pixi.js zu zeichnen
async function drawGraph(filePath) {
    const graphVertexShader = await loadShader('./graph.vert')
    const graphFragmentShader = await loadShader('./graph.frag')
    const backgroundVertexShader = await loadShader('./background.vert')
    const backgroundFragmentShader = await loadShader('./background.frag')

    const parsedData = await fetchCSV(filePath);
    if (!parsedData.length) return;

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    await app.init({ background: '#000', resizeTo: window });
    document.body.appendChild(app.canvas);

   
    PIXI.Assets.addBundle('fonts', {
        XoloniumBold: {
            src: './XoloniumBold-xKZO.ttf',
            data: { family: 'Xolonium Bold' },
        },
        Xolonium: {
            src: './Xolonium-pn4D.ttf',
            data: { family: 'Xolonium' },
        },
    });

    await PIXI.Assets.loadBundle('fonts')

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 36,
        stroke: { color: '#fff', width: 5, join: 'round' },
        dropShadow: {
            color: '#000',
            blur: 4,
            angle: Math.PI / 6,
            distance: 6,
        },
        wordWrap: false,
        wordWrapWidth: 440,
    });
    const dateLabel = new PIXI.Text("", textStyle);
    dateLabel.anchor.set(0.0,0.0)
    app.stage.addChild(dateLabel);

    const priceLabel = new PIXI.Text("", textStyle);
    priceLabel.anchor.set(1.5,1.0)
    app.stage.addChild(priceLabel);

    const bitcoinSvg = await PIXI.Assets.load({
        src: './bitcoin.png',
    });
    const bitcoinLogo = new PIXI.Sprite(bitcoinSvg);
    app.stage.addChild(bitcoinLogo);
    bitcoinLogo.anchor.set(0.5,0.5)

    const stackLabel = new PIXI.Text("", textStyle);
    stackLabel.anchor.set(0.5,1.0)
    app.stage.addChild(stackLabel);


    const buyPaused = 2000
    const maxVisiblePoints = 100; // Anzahl der sichtbaren Punkte im Graph

    let options = {
        fiatStart: 1000,
        dateStart: new Date(2011,0,1), // new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds);
        dateEnd: new Date(2030,0,1),
        stops: 7
    }

    options.dateStart = parsedData[findClosestDateIndex(parsedData, options.dateStart)].snapped_at
    options.dateEnd = parsedData[findClosestDateIndex(parsedData, options.dateEnd)].snapped_at
    options.indexStart = Math.max(maxVisiblePoints, findClosestDateIndex(parsedData, options.dateStart))
    options.indexEnd = Math.max(maxVisiblePoints, findClosestDateIndex(parsedData, options.dateEnd))
    if (typeof options.stops === 'number' && !isNaN(options.stops)) {
        options.stops = generateDatesBetween(options.dateStart, options.dateEnd, options.stops)
    } else if (Array.isArray(options.stops)) {
        options.stops = options.stops.map(d => typeof d === 'string' && parseDate(d))
    }
    options.stopIndizes = options.stops.map(d => findClosestDateIndex(parsedData, d))

   console.log(options, parsedData)

    let yourCoins = 0
    let yourFiat = options.fiatStart
    let paused = Number.MAX_VALUE
    const trades = []
    
    addEventListener('pointerup', () => {
        let price = parsedData[currentIndexInteger].price
        let trade =  {
            index: currentIndexInteger, 
            price: price, 
            coins: yourCoins, 
            fiat: yourFiat,
            sprite: null,
            container: new PIXI.Container()
        }
       
        
        if (yourCoins > 0) {
            trade.sold = 'BTC'
            trade.bought = 'USD'
            trade.coins = yourCoins
            yourFiat = yourCoins * price
            yourCoins = 0
            trade.sprite = new PIXI.Graphics()
            trade.sprite.circle(0, 0, 50);
            trade.sprite.fill(0x00FF00, 1);

            const label = new PIXI.Text("$", textStyle);
            label.anchor.set(0.5,0.5)
            trade.container.addChild(trade.sprite)
            trade.container.addChild(label);
        } else {
            trade.sold = 'USD'
            trade.bought = 'BTC'
            trade.fiat = yourFiat
            yourCoins = yourFiat / price
            yourFiat = 0
            trade.sprite = new PIXI.Sprite(bitcoinSvg)
            trade.sprite.anchor.set(0.5,0.5)
            trade.container.addChild(trade.sprite)

        }


        trades.push(trade)
        app.stage.addChild(trade.container)
        paused = buyPaused
    })

    const gameDurationMilliseconds = 90000
    const factorMilliSeconds =  parsedData.length / gameDurationMilliseconds; // Intervall in Sekunden
    let currentIndexFloat = options.indexStart; // Zeitverfolgung
    let currentIndexInteger = Math.floor(currentIndexFloat)


    let graphPoints = new Float32Array(maxVisiblePoints * 2); // x, y für jeden Punkt
    var graph = createGraph(graphPoints, graphVertexShader, graphFragmentShader)
    graph.position.set(0, 0);
    app.stage.addChildAt(graph,1);

    const background = createBackground(backgroundVertexShader, backgroundFragmentShader);
    background.position.set(0, 0);
    app.stage.addChildAt(background,0);


    app.ticker.add((deltaTime) => {

        if (paused <= 0) {
            currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds;
        } else {
            paused -= deltaTime.elapsedMS
            if (paused < buyPaused) {
                currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds*(Math.max(0,(buyPaused-paused*2)/buyPaused));
            }
        }

        if (currentIndexFloat > options.indexEnd) {
            currentIndexFloat = options.indexEnd
        }

        currentIndexInteger = Math.floor(currentIndexFloat)

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyle.fontSize = Math.max(32, (Math.max(app.renderer.height, app.renderer.width) / 1080)*36)
        textStyle.stroke.width = textStyle.fontSize*0.2

        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width


        const stepX = app.renderer.width / maxVisiblePoints * 0.85;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndexInteger-maxVisiblePoints; i <= currentIndexInteger; i++) {
            maxPrice = Math.max(maxPrice, parsedData[i].price)
            minPrice = Math.min(minPrice, parsedData[i].price)
        }
       
        for (let i = currentIndexInteger-maxVisiblePoints; i <= currentIndexInteger; i++) {
            const price = parsedData[i].price
            const x = (i - (currentIndexInteger-maxVisiblePoints));
            const y = -(price-minPrice)/(maxPrice-minPrice);
            var pi = (i-(currentIndexInteger-maxVisiblePoints))
            graphPoints[2*pi] = x
            graphPoints[1+2*pi] = y
        }

        graph.position.set(0, app.renderer.height*0.9);
        graph.scale.set(stepX, app.renderer.height*0.8);
        graph.geometry.getBuffer('aPosition').data = createThickLine(graphPoints,Math.max(app.renderer.height,app.renderer.width)*0.005) 
        graph.geometry.getBuffer('aColor').data = createThickLineColors(graphPoints)
   
        const price = parsedData[currentIndexInteger].price
        const x = (currentIndexInteger - (currentIndexInteger-maxVisiblePoints)) * stepX;
        const y = app.renderer.height*0.9-(price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
        priceLabel.y = Math.min(app.renderer.height*0.9, Math.max(textStyle.fontSize*2, 0.9*priceLabel.y + 0.1*y))
        priceLabel.x = 0.9*priceLabel.x + 0.1*x
        priceLabel.text = formatCurrency(price, 'USD', (price < 100) ? 2 : (((price >= 100 && price < 1000) || (price >= 100000 && price < 1000000)|| (price >= 10000000 && price < 100000000)) ? 0 : 1), true)
        bitcoinLogo.x = x
        bitcoinLogo.y = y 
        bitcoinLogo.height = bitcoinLogo.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, yourCoins / 10.0)))
    
        
        trades.forEach((trade) => {
            trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints)) * stepX;
            trade.container.y = app.renderer.height*0.9-  (trade.price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, trade.coins / 10.0)))
         })

        const currentDate = parsedData[currentIndexInteger]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        stackLabel.text = (yourCoins > 0 && formatCurrency(yourCoins, 'BTC', 8) || '') + (yourFiat > 0 && formatCurrency(yourFiat, 'USD', yourFiat >= 1000 ? 0 : 2) || '')
        background.shader.resources.backgroundUniforms.uniforms.uMode = yourCoins > 0 ? 1 : 0
    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');
})
