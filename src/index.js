const coins = {
    USD: { image: './gfx/usd.png', currency: 'USD', sound: 'sfx/usd.wav', csv: null, data: null, audio: null, texture: null, digits: 2},
    BTC: { image: './gfx/btc.png', currency: 'BTC', sound: 'sfx/btc.wav', csv: 'data/btc-usd-max.csv',  digits: 8},
    ADA: { image: './gfx/ada.png', currency: 'ADA', sound: 'sfx/btc.wav', csv: 'data/ada-usd-max.csv',  digits: 2},
    DOGE: { image: './gfx/doge.png', currency: 'D', sound: 'sfx/btc.wav', csv: 'data/doge-usd-max.csv',  digits: 2},
    ETH: { image: './gfx/eth.png', currency: 'ETH', sound: 'sfx/btc.wav', csv: 'data/eth-usd-max.csv',  digits: 2},
    SOL: { image: './gfx/sol.png', currency: 'SOL', sound: 'sfx/btc.wav', csv: 'data/sol-usd-max.csv',  digits: 2},
}

function playBuySound(key) {
    if (coins[key].audio) {
        coins[key].audio.currentTime = 0
        coins[key].audio.play()
    }
}


// Funktion, um den Graphen mit Pixi.js zu zeichnen
async function initGame() {
    const graphVertexShader = await loadShader('./gfx/graph.vert')
    const graphFragmentShader = await loadShader('./gfx/graph.frag')
    const backgroundVertexShader = await loadShader('./gfx/background.vert')
    const backgroundFragmentShader = await loadShader('./gfx/background.frag')

    await fetchData(coins);

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    await app.init({ background: '#000', resizeTo: window });
    document.body.appendChild(app.canvas);

   const containerForeground = new PIXI.Container()
   const containerBackground = new PIXI.Container()
   app.stage.addChild(containerBackground)
   app.stage.addChild(containerForeground)

    PIXI.Assets.addBundle('fonts', {
        XoloniumBold: {
            src: './gfx/XoloniumBold-xKZO.ttf',
            data: { family: 'Xolonium Bold' },
        },
        Xolonium: {
            src: './gfx/Xolonium-pn4D.ttf',
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

    const textStyleCentered = textStyle.clone()
    textStyleCentered.align = 'center'
    textStyleCentered.wordWrap = true
    const dateLabel = new PIXI.Text("", textStyle);
    dateLabel.anchor.set(0.0,0.0)
    containerForeground.addChild(dateLabel);

    await Promise.all(Object.keys(coins).map(async (key) => {
        coins[key].texture = await PIXI.Assets.load({
            src: coins[key].image,
        });

        coins[key].audio = new Audio(coins[key].sound)
    }))

    const stackLabel = new PIXI.Text("", textStyleCentered);
    stackLabel.anchor.set(0.5,1.1)
    containerForeground.addChild(stackLabel);

    const backgroundImage = new PIXI.Sprite(coins['BTC'].texture);
    backgroundImage.anchor.set(0.5); // Zentrieren um den Mittelpunkt
    containerBackground.addChild(backgroundImage);
    backgroundImage.rotation =  0.1;
    backgroundImage.alpha = 0.1;

    const buyPaused = 1000
   
    const gameData = await fetchGameData(coins)
    let options = gameData.levels[gameData.levels.length-1]
    var maxVisiblePoints = Math.max(7,  Math.floor((options.stopIndizes[1] - options.stopIndizes[0])*1.1))

    let fiatName = Object.keys(coins)[0]
    let yourFiat = options.fiatStart
    let yourCoins = yourFiat
    let yourCoinName = fiatName
    let paused = Number.MAX_VALUE

    const gameDurationMilliseconds = 10000
    const factorMilliSeconds =  (options.indexEnd - options.indexStart) / gameDurationMilliseconds; // Intervall in Sekunden
    let currentIndexFloat = options.indexStart; // Zeitverfolgung
    let currentIndexInteger = Math.floor(currentIndexFloat)


    
    const trades = []
    
    const doTrade = (from, to) => {

        


        if ((coins[to].csv && !coins[to].data[currentIndexInteger].price) || (coins[from].csv && !coins[from].data[currentIndexInteger].price)) {
            console.log('trade not possible null data', from, to, currentIndexInteger)
            return
        }

        let trade =  {
            index: currentIndexInteger, 

            fromPrice: from === fiatName ? 1 : coins[from].data[currentIndexInteger].price,
            fromName: yourCoinName,
            fromCoins: yourCoins,

            toPrice: to === fiatName ? 1 : coins[to].data[currentIndexInteger].price, 
            toName: to, 
            
            toCoins: -1,
            
            sprite: null,
            container: new PIXI.Container(),
        }

        
        trade.toCoins = (trade.fromCoins * trade.fromPrice) / trade.toPrice

      

        trade.sprite = new PIXI.Sprite(coins[to].texture)
        trade.sprite.anchor.set(0.5,0.5)
        trade.container.addChildAt(trade.sprite, 0)
        trade.labelPrice = new PIXI.Text(formatCurrency(trade.toPrice, fiatName,null, true) , textStyle)
        trade.labelPrice.anchor.set(0.5,1.5)
        trade.container.addChild(trade.labelPrice)
        if (from === to) {
            trade.labelPrice.scale.set(1.0)
        } else {
            playBuySound(trade.toName)
        }


        trade.fiat = trade.fromCoins *  trade.fromPrice,
        yourFiat = trade.fiat
        yourCoins = trade.toCoins
        yourCoinName = trade.toName
       
        trades.push(trade)
        containerBackground.addChild(trade.container)
        paused = buyPaused
    }


    const coinButtons = options.coinNames.map((c,i) => {
        let container = new PIXI.Container()
        let sprite = new PIXI.Sprite(coins[c].texture);
        sprite.anchor.set(0.5,0.5)
        container.addChild(sprite)
        return {
            to: c,
            index: i,
            container: container,
            sprite: sprite
        }
    })

    const coinButtonContainer = new PIXI.Container()
    let coinButtonContainerTitle = new PIXI.Text('What do you want?', textStyleCentered)
    coinButtonContainerTitle.anchor.set(0.5,0.)
    coinButtonContainer.addChild(coinButtonContainerTitle)
    coinButtons.forEach(b => {
        coinButtonContainer.addChild(b.container)
    })
    containerForeground.addChild(coinButtonContainer)

    addEventListener('pointerup', (event) => {

        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)

        if (stopIndex > -1 && stopIndex < options.stopIndizes.length-1) {
            
            let xR = event.x - coinButtonContainer.x
            let yR = event.y - coinButtonContainer.y
            if (yR > 0) {
                let i = Math.floor(xR/app.renderer.width *coinButtons.length)

                if (i >= 0 && i < coinButtons.length) {
                    doTrade(yourCoinName,coinButtons[i].to )
                }
               
            }
           
        }

    })


    var graph = createGraph(coins['BTC'].data, graphVertexShader, graphFragmentShader, 'BTC', coins, textStyle)
    graph.position.set(0, 0);
    containerBackground.addChildAt(graph,1);

    const background = createBackground(backgroundVertexShader, backgroundFragmentShader);
    background.position.set(0, 0);       
    containerBackground.addChildAt(background,0);


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

        let missedStopIndex = options.stopIndizes.findIndex(stop => stop < currentIndexInteger && !trades.find(t => t.index === stop))
        if (missedStopIndex > -1) {
            currentIndexFloat = options.stopIndizes[missedStopIndex]
            currentIndexInteger = Math.floor(currentIndexFloat)
        }
        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
        let trade = trades.find(t => t.index === currentIndexInteger)

        if (stopIndex > -1) {
            
            if (!trade && stopIndex === options.stopIndizes.length-1) {
                doTrade(yourCoinName, fiatName)
            }
            
            if (!trade) {
                paused = Number.MAX_VALUE
            } else {
                if (stopIndex < options.stopIndizes.length-1) {
                    maxVisiblePoints = Math.max(7, Math.floor((options.stopIndizes[stopIndex+1] - options.stopIndizes[stopIndex])*1.1))
                } else {
                    maxVisiblePoints = options.stopIndizes[options.stopIndizes.length-1] - options.stopIndizes[0]
                
                }
               
            }
        }


     

        let priceData = coins['BTC'].data
        const currentDate = priceData[currentIndexInteger]?.date;
        const price = priceData[currentIndexInteger].price
        const stepX = app.renderer.width / (maxVisiblePoints-1) * 0.9;
        let isFinalScreen = !(currentIndexInteger < options.stopIndizes[options.stopIndizes.length-1])
        
        
        updateGraph(graph, app, priceData, currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, coins, fiatName)
        if (!isFinalScreen) {
            dateLabel.alpha = 1
            let label = `${new Date(currentDate).toLocaleDateString()}\n\n`
            if (stopIndex > -1) {
                label += `Trade ${stopIndex+1}/${options.stops.length-1}\n` 
                label += ("\nYou have:\n" + formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits) || '') + "\n"
                coinButtons.filter(cb => cb.to !== fiatName).forEach(cb => {
                    let p = coins[cb.to].data[currentIndexInteger].price
                    if (p) {
                        label += `\n${formatCurrency(1, cb.to,0, false)} = ` + formatCurrency(p, fiatName,null, true)
                    }
                })  
            }
            
        
            dateLabel.text = label
        } else {
            let fiat = yourFiat
            let txt = "Congratulations\n\n" 
            txt += `You traded ${trades.filter(t => t.bought !== t.sold).length} times\n\nand went from\n${formatCurrency(options.fiatStart, fiatName, options.fiatStart >= 1000 ? 0 : 2)} to ${formatCurrency(fiat, fiatName, fiat >= 1000 ? 0 : 2)}\n\n`
            txt += `between\n${options.dateStart.toLocaleDateString()} and ${options.dateEnd.toLocaleDateString()}\n\n`
            txt += `Maximum would have been:\n${formatCurrency(options.fiatBest, fiatName, options.fiatBest >= 1000 ? 0 : 2)}\n\n`
            txt += `Minimum would have been:\n${formatCurrency(options.fiatWorst, fiatName, options.fiatBest >= 1000 ? 0 : 2)}\n\n`
            txt += "Try again?"
            dateLabel.text = txt
            dateLabel.alpha = 1
        }
        dateLabel.x = 0.025*app.renderer.width
        dateLabel.y = 0.025*app.renderer.width
        if (stopIndex === 0) {
            dateLabel.text = `You can trade\n${coinButtons.map(b => b.to).join(', ')}\n\n${options.stops.length-1} times\nbetween\n\n${options.dateStart.toLocaleDateString()} and \n${options.dateEnd.toLocaleDateString()}\n\nChoose wisely and\nGood luck!`;
            dateLabel.alpha = 1
        }

        let maxPrice = priceData[currentIndexInteger].price
        let minPrice = priceData[currentIndexInteger].price
        trades.forEach((trade) => {
            trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints+2)) * stepX;
            trade.container.y = app.renderer.height*0.9-  (trade.price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            if (trade.sprite) {
                trade.sprite.height = trade.sprite.width = app.renderer.width*0.04
            }
             if (trade.index > currentIndexInteger - maxVisiblePoints) {  
                trade.labelPrice.position.set(trade.labelPrice.width*0.5,0) 
            } else {
                trade.labelPrice.position.set(0,0)
            }
         })

      

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyleCentered.fontSize =  textStyle.fontSize = Math.max(24, (Math.max(app.renderer.height, app.renderer.width) / 1080)*24)
        textStyleCentered.stroke.width = textStyle.stroke.width = textStyle.fontSize*0.2
        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width
        stackLabel.text = "You have\n" + formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits) || ''
        background.shader.resources.backgroundUniforms.uniforms.uMode = yourCoins > 0 ? 1 : 0
        background.shader.resources.backgroundUniforms.uniforms.uTime = deltaTime.lastTime
        backgroundImage.texture = coins[yourCoinName].texture
        backgroundImage.x = app.renderer.width / 2 + Math.sin(deltaTime.lastTime*0.0001)*app.renderer.width / 16;
        backgroundImage.y = app.renderer.height / 2 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;


        if (stopIndex === 0) {
            coinButtonContainerTitle.text = 'What do you want?'
        } else {
            coinButtonContainerTitle.text =  'Want to trade?'
        }
       
        if (stopIndex > -1 && stopIndex < options.stopIndizes.length-1 && !trade) {
            coinButtonContainerTitle.x =app.renderer.width*0.5 
            coinButtons.forEach(b => {
                b.sprite.height = b.sprite.width = Math.min(app.renderer.height*0.1, app.renderer.width*0.9 / coinButtons.length)
                b.container.x = (app.renderer.width / coinButtons.length)*(b.index+0.5)
                b.container.y = b.sprite.height
                b.sprite.y = b.sprite.height*0.5
                b.sprite.rotation = Math.sin(deltaTime.lastTime*0.01- (1000/coinButtons.length)*b.index)*0.1
                b.sprite.alpha = (deltaTime.lastTime - (1000/coinButtons.length)*b.index) % 1500 > 500 ? 1 : 0.5 
                b.sprite.alpha = (!coins[b.to].csv || coins[b.to].data[currentIndexInteger].price) ? b.sprite.alpha : 0.0
            
            })
            coinButtonContainer.y = app.renderer.height - coinButtons[0].sprite.height*2.2

            coinButtonContainer.alpha = 1
            stackLabel.alpha = 0
        } else {
            coinButtonContainer.alpha = 0
            stackLabel.alpha = 1
        }
    });
}

window.addEventListener("load", (event) => {
    initGame();
})
