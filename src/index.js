const coins = {
    USD: { color: '#000', image: './gfx/usd.png', currency: 'USD', sound: 'sfx/usd.wav', csv: null, data: null, audio: null, texture: null, digits: 2},
    BTC: { color: '#F7931B', image: './gfx/btc.png', currency: 'BTC', sound: 'sfx/btc.wav', csv: 'data/btc-usd-max.csv',  digits: 8},
    ADA: { color: '#0133AD', image: './gfx/ada.png', currency: 'ADA', sound: 'sfx/btc.wav', csv: 'data/ada-usd-max.csv',  digits: 2},
    DOGE: { color: '#BA9F32', image: './gfx/doge.png', currency: 'D', sound: 'sfx/btc.wav', csv: 'data/doge-usd-max.csv',  digits: 2},
    ETH: { color: '#383938', image: './gfx/eth.png', currency: 'ETH', sound: 'sfx/btc.wav', csv: 'data/eth-usd-max.csv',  digits: 2},
    SOL: { color: '#BD3EF3', image: './gfx/sol.png', currency: 'SOL', sound: 'sfx/btc.wav', csv: 'data/sol-usd-max.csv',  digits: 2},
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
        autoDensity: true,
       
    });
    await app.init({ background: '#000', resizeTo: window });
    document.body.appendChild(app.canvas);
    app.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    app.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });


    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen

   const containerForeground = new PIXI.Container()
   const containerBackground = new PIXI.Container()
   let containerGraphs = new PIXI.Container()

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

    const backgroundImage = new PIXI.Sprite();
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

    const gameDurationMilliseconds = 7*2000
    const factorMilliSeconds =  (options.indexEnd - options.indexStart) / gameDurationMilliseconds; // Intervall in Sekunden
    let currentIndexFloat = options.indexStart; // Zeitverfolgung
    let currentIndexInteger = Math.floor(currentIndexFloat)
    let focusedCoinName = null
    let isMultiCoin = options.coinNames.length > 2
    
    let trades = []
    
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

      

     
        trade.labelPrice = new PIXI.Text(formatCurrency(trade.toPrice, fiatName,null, true) , textStyle)
        trade.labelPrice.anchor.set(0.5,1.5)
        trade.container.addChild(trade.labelPrice)
        if (from === to) {
            trade.labelPrice.scale.set(1.0)
        } else {
            trade.sprite = new PIXI.Sprite(coins[to].texture)
            trade.sprite.anchor.set(0.5,0.5)
            trade.sprite.height = trade.sprite.width = 0
            trade.container.addChildAt(trade.sprite, 0)

            playBuySound(trade.toName)
        }


        trade.fiat = trade.fromCoins *  trade.fromPrice,
        yourFiat = trade.fiat
        yourCoins = trade.toCoins
        yourCoinName = trade.toName
       
        trades.push(trade)
        containerGraphs.addChild(trade.container)
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

    function getCoinButtonIndex(event) {
        let xR = event.x - coinButtonContainer.x
        let yR = event.y - coinButtonContainer.y
        if (yR > 0) {
            let i = Math.floor(xR/app.renderer.width *coinButtons.length)
            if (i >= 0 && i < coinButtons.length) {
                return i
            }
        }
        return -1
    }
   

    app.stage.addEventListener('pointermove', (event) => {
        let trade = trades.find(t => t.index === currentIndexInteger)
        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
    
        if (stopIndex > -1 && stopIndex < options.stopIndizes.length-1 && !trade) {
            let i = getCoinButtonIndex(event)
            if (i >= 0 && i < coinButtons.length && coinButtons[i].active) {
                focusedCoinName = coinButtons[i].to
             } else {
                 focusedCoinName = null
             }
        }
    });


     app.stage.addEventListener('pointerup', (event) => {
        let trade = trades.find(t => t.index === currentIndexInteger)
        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
        if (stopIndex > -1 && stopIndex < options.stopIndizes.length-1  && !trade) {
            let i = getCoinButtonIndex(event)
            if (i >= 0 && i < coinButtons.length) {
                doTrade(yourCoinName,coinButtons[i].to )
            }
        }

       
    })

    const graphs = options.coinNames.filter(name => name !== fiatName).map((c,i) => {
        let container = new PIXI.Container()
        let graph = createGraph(c, graphVertexShader, graphFragmentShader, coins, textStyle)
        graph.position.set(0, 0);
        container.addChild(graph)
        return {
            coinName: c,
            index: i,
            container: container,
            graph: graph
        }
    })

    graphs.forEach(g => {
        containerGraphs.addChildAt(g.graph); 
    })
    containerBackground.addChildAt(containerGraphs,1)

   

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
                doTrade(yourCoinName, yourCoinName)
            }
            
            if (!trade) {
                paused = Number.MAX_VALUE
            } else {
                if (stopIndex < options.stopIndizes.length-1) {
                    maxVisiblePoints = Math.max(7, Math.floor((options.stopIndizes[stopIndex+1] - options.stopIndizes[stopIndex])*1.1))
                } else {
                    maxVisiblePoints = options.stopIndizes[options.stopIndizes.length-1] - options.stopIndizes[0]
                    trades.filter(t => t.index !== options.stopIndizes[0] && (t.index === options.stopIndizes[options.stopIndizes.length-1] || t.toName === t.fromName)).forEach(trade => {
                        trade.container.visible = false
                    })
                }
               
            }
        }


        const currentDate = coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date;
        const stepX = app.renderer.width / (maxVisiblePoints-1) * 0.9;
        let isFinalScreen = !(currentIndexInteger < options.stopIndizes[options.stopIndizes.length-1])
        
        let diffCurrentIndexIntToFloat=currentIndexFloat-currentIndexInteger
        containerGraphs.position.set(-diffCurrentIndexIntToFloat*stepX,0)


        graphs.forEach(g => {
            updateGraph(g.graph, app, currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat)
        })
        
        if (!isFinalScreen) {
            dateLabel.visible = true
            let label = `${currentDate.toLocaleDateString()}\n\n`
          /*  if (stopIndex > -1) {
                label += `Trade ${stopIndex+1}/${options.stops.length-1}\n` 
                label += ("\nYou have:\n" + formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits) || '') + "\n"
                coinButtons.filter(cb => cb.to !== fiatName).forEach(cb => {
                    let p = coins[cb.to].data[currentIndexInteger].price
                    if (p) {
                        label += `\n${formatCurrency(1, cb.to,0, false)} = ` + formatCurrency(p, fiatName,null, true)
                    }
                })  
            }*/
            
            dateLabel.text = `Today is: ${currentDate.toLocaleDateString()}\nYou have: ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}`
                
           // dateLabel.text = label
        } else {
            let fiat = yourFiat
            let txt = "Congratulations\n\n" 
            txt += `You traded ${trades.filter(t => t.toName !== t.fromName).length} times\n\nand went from\n${formatCurrency(options.fiatStart, fiatName, options.fiatStart >= 1000 ? 0 : 2)} to ${formatCurrency(fiat, fiatName, fiat >= 1000 ? 0 : 2)}\n\n`
            txt += `between\n${options.dateStart.toLocaleDateString()} and ${options.dateEnd.toLocaleDateString()}\n\n`
            txt += `Maximum would have been:\n${formatCurrency(options.fiatBest, fiatName, options.fiatBest >= 1000 ? 0 : 2)}\n\n`
            txt += `Minimum would have been:\n${formatCurrency(options.fiatWorst, fiatName, options.fiatBest >= 1000 ? 0 : 2)}\n\n`
            txt += "Try again?"
            dateLabel.text = txt
            dateLabel.visible = true
        }

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyleCentered.fontSize =  textStyle.fontSize = Math.max(18, (Math.max(app.renderer.height, app.renderer.width) / 1080)*18)
        textStyleCentered.stroke.width = textStyle.stroke.width = textStyle.fontSize*0.2
        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width
        stackLabel.text = ""//"You have\n" + formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits) || ''
        //background.shader.resources.backgroundUniforms.uniforms.uColor = hexToRGB(coins[yourCoinName].color, 1.0)
        background.shader.resources.backgroundUniforms.uniforms.uTime = deltaTime.lastTime
        backgroundImage.texture = coins[yourCoinName].texture
        backgroundImage.x = app.renderer.width / 2 + Math.sin(deltaTime.lastTime*0.0001)*app.renderer.width / 16;
        backgroundImage.y = app.renderer.height / 2 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;
        coinButtonContainerTitle.text = 'What do you want?'
        
        coinButtons.forEach(b => {
            b.active = !coins[b.to].data || coins[b.to].data[currentIndexInteger]?.price ? true : false
        })

        if (stopIndex > -1 && stopIndex < options.stopIndizes.length-1 && !trade) {
            coinButtonContainerTitle.x =app.renderer.width*0.5 
            coinButtonContainerTitle.rotation = Math.sin(deltaTime.lastTime*0.005)*0.05
            let maxButtonHeight = 0
            coinButtons.forEach(b => {
                b.sprite.height = b.sprite.width = Math.min(app.renderer.height*0.1, app.renderer.width*0.9 / coinButtons.length)
                maxButtonHeight = Math.max(maxButtonHeight, b.sprite.height)
                b.container.x = (app.renderer.width / coinButtons.length)*(b.index+0.5)
                b.container.y = b.sprite.height
                b.sprite.y = b.sprite.height*0.5
                b.sprite.rotation = Math.sin(deltaTime.lastTime*0.01- (1000/coinButtons.length)*b.index)*0.1
                b.sprite.alpha = focusedCoinName ? (b.to === focusedCoinName && b.active && 1.0 || 0.1) : (deltaTime.lastTime - (1000/coinButtons.length)*b.index) % 1500 > 500 ? 1 : 0.5 
                b.sprite.alpha = (!coins[b.to].csv || b.active) ? b.sprite.alpha : 0.0
               
            })
            coinButtonContainer.y = app.renderer.height - maxButtonHeight*2.2

            coinButtonContainer.visible = true
            stackLabel.visible = false
        } else {
            coinButtonContainer.visible = false
            stackLabel.visible = true
            focusedCoinName = null
        }
    });
}

window.addEventListener("load", (event) => {
    initGame();
})
