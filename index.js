const buySounds = {
    BTC: new Audio('btc.wav'),
    USD: new Audio('usd.wav')
}

function playBuySound(key) {
    if (buySounds[key]) {
        buySounds[key].currentTime = 0
        buySounds[key].play()
    }

}


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
        fontSize: 32,
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


    const bitcoinLogo = new PIXI.Container()
    const bitcoinLogoSprite = new PIXI.Sprite(bitcoinSvg);
    bitcoinLogo.addChild(bitcoinLogoSprite)
    app.stage.addChild(bitcoinLogo);
    bitcoinLogoSprite.anchor.set(0.5,0.5)
    bitcoinLogoSprite.scale.set(0.001,0.001)
    const bitcoinLogoQuestion = new PIXI.Text("?", textStyle)
    bitcoinLogoQuestion.anchor.set(0.5,0.5)
    bitcoinLogo.addChild(bitcoinLogoQuestion);


    const stackLabel = new PIXI.Text("", textStyle);
    stackLabel.anchor.set(0.5,1.0)
    app.stage.addChild(stackLabel);

    const backgroundTextStyle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 1536,
        fill: '#fff'
    });


    const backgroundLabel = new PIXI.Text('Bitcoin', backgroundTextStyle)
    backgroundLabel.anchor.set(0.5); // Zentrieren um den Mittelpunkt
    app.stage.addChild(backgroundLabel);
    backgroundLabel.rotation =  0.1;
    backgroundLabel.alpha = 0.1;

    const buyPaused = 2000
   
    const gameData = await fetchGameData(parsedData)
    let options = gameData.levels[1]
    var maxVisiblePoints = maxVisiblePoints = options.stopIndizes[1] - options.stopIndizes[0]+10

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

        playBuySound(trade.bought)

        trades.push(trade)
        app.stage.addChild(trade.container)
        paused = buyPaused
    })

    const gameDurationMilliseconds = 90000
    const factorMilliSeconds =  parsedData.length / gameDurationMilliseconds; // Intervall in Sekunden
    let currentIndexFloat = options.indexStart; // Zeitverfolgung
    let currentIndexInteger = Math.floor(currentIndexFloat)

    var graph = createGraph(parsedData, graphVertexShader, graphFragmentShader)
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
        bitcoinLogoSprite.alpha = 1.0
        bitcoinLogoQuestion.alpha = 0.0
        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
        if (stopIndex > -1) {
            let trade = trades.find(t => t.index === currentIndexInteger)
            if (!trade && stopIndex < options.stopIndizes.length-1) {
                paused = Number.MAX_VALUE

                bitcoinLogoSprite.alpha = deltaTime.lastTime % 1000 > 500 ? 1 : 0 
                bitcoinLogoQuestion.alpha = 1.0 - bitcoinLogoSprite.alpha
            } else {
                if (stopIndex < options.stopIndizes.length-1) {
                    maxVisiblePoints = options.stopIndizes[stopIndex+1] - options.stopIndizes[stopIndex]+10
                } else {
                    maxVisiblePoints = options.stopIndizes[options.stopIndizes.length-1] - options.stopIndizes[0] +10
                }
               
            }
        }


        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyle.fontSize = Math.max(32, (Math.max(app.renderer.height, app.renderer.width) / 1080)*36)
        textStyle.stroke.width = textStyle.fontSize*0.2

        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width


        const stepX = app.renderer.width / (maxVisiblePoints-1) * 0.9;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndexInteger-maxVisiblePoints+1; i <= currentIndexInteger; i++) {
            maxPrice = Math.max(maxPrice, parsedData[i].price)
            minPrice = Math.min(minPrice, parsedData[i].price)
        }
       
        
        var scaleY = -app.renderer.height*0.8/(maxPrice-minPrice)
        var scaleX = stepX
        graph.position.set(- (currentIndexInteger-maxVisiblePoints+1)*scaleX, app.renderer.height*0.9-minPrice*scaleY);
        graph.scale.set(scaleX, scaleY);
        graph.shader.resources.graphUniforms.uniforms.uCurrentIndex = currentIndexInteger
        graph.shader.resources.graphUniforms.uniforms.uMaxVisiblePoints = maxVisiblePoints
        
      
        const price = parsedData[currentIndexInteger].price
        const x = (currentIndexInteger - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
        const y = app.renderer.height*0.9-(price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
        priceLabel.y = Math.min(app.renderer.height*0.9, Math.max(textStyle.fontSize*2, 0.9*priceLabel.y + 0.1*y))
        priceLabel.x = 0.9*priceLabel.x + 0.1*x
        priceLabel.text = formatCurrency(price, 'USD',null, true) 

        /* DO NOOT DELETE !!!!!
        priceLabel.x = app.renderer.width*1
        priceLabel.y = app.renderer.height*0.8
        priceLabel.text = formatCurrency(0.00021, 'USD',null, true) + '\n' + formatCurrency(0.0021, 'USD',null, true) + '\n' + formatCurrency(0.021, 'USD',null, true) + '\n' +  formatCurrency(0.21, 'USD',null, true) + '\n' + formatCurrency(2.21, 'USD',null, true) + '\n' + formatCurrency(21.21, 'USD',null, true) + '\n' + formatCurrency(212.21, 'USD',null, true) + '\n' + formatCurrency(2121.21, 'USD',null, true) + '\n' + formatCurrency(21212.21, 'USD',null, true) + '\n' + formatCurrency(221212.21, 'USD',null, true) + '\n' + formatCurrency(2212121.21, 'USD',null, true) + '\n' + formatCurrency(22121212.21, 'USD',null, true)  + '\n' + formatCurrency(221212121.21, 'USD',null, true) + '\n' + formatCurrency(2212121221.21, 'USD',null, true) 
        */
        
        bitcoinLogo.x = x
        bitcoinLogo.y = y 
        bitcoinLogoSprite.height = bitcoinLogoSprite.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, yourCoins / 10.0)))
    
        
        trades.forEach((trade) => {
            trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
            trade.container.y = app.renderer.height*0.9-  (trade.price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, trade.coins / 10.0)))
         })

        const currentDate = parsedData[currentIndexInteger]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        stackLabel.text = (yourCoins > 0 && formatCurrency(yourCoins, 'BTC', 8) || '') + (yourFiat > 0 && formatCurrency(yourFiat, 'USD', yourFiat >= 1000 ? 0 : 2) || '')
        background.shader.resources.backgroundUniforms.uniforms.uMode = yourCoins > 0 ? 1 : 0

        backgroundLabel.text = yourCoins > 0 ? "\u20BF" : '$'
        backgroundLabel.x = app.renderer.width / 2 + Math.sin(deltaTime.lastTime*0.0001)*app.renderer.width / 16;
        backgroundLabel.y = app.renderer.height / 2 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;

    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');
})
