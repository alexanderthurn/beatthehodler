const coins = {
    USD: { color: '#85BB65', colorInt: 0x85BB65, image: './gfx/usd.png', currency: 'USD', sound: 'sfx/usd.wav', csv: null, data: null, audio: null, texture: null, digits: 2},
    BTC: { color: '#F7931B', colorInt: 0xF7931B,image: './gfx/btc.png', currency: 'BTC', sound: 'sfx/btc.wav', csv: 'data/btc-usd-max.csv',  digits: 8},
    ADA: { color: '#0133AD', colorInt: 0x0133AD,image: './gfx/ada.png', currency: 'ADA', sound: 'sfx/btc.wav', csv: 'data/ada-usd-max.csv',  digits: 2},
    DOGE: { color: '#BA9F32', colorInt: 0xBA9F325,image: './gfx/doge.png', currency: 'D', sound: 'sfx/btc.wav', csv: 'data/doge-usd-max.csv',  digits: 2},
    ETH: { color: '#383938', colorInt: 0x383938,image: './gfx/eth.png', currency: 'ETH', sound: 'sfx/btc.wav', csv: 'data/eth-usd-max.csv',  digits: 2},
    SOL: { color: '#BD3EF3', colorInt: 0xBD3EF3,image: './gfx/sol.png', currency: 'SOL', sound: 'sfx/btc.wav', csv: 'data/sol-usd-max.csv',  digits: 2},
}

function playBuySound(key) {
    if (coins[key].audio) {
        coins[key].audio.currentTime = 0
        coins[key].audio.play()
    }
}
const SCALE_TEXT_BASE = 1.0/16.0*1.5
const gscale = 0.5 // how much screen height does the graph take
const gscalet = 0.2 // how much screen height space on top
const gscaleb = 1.0 - gscale - gscalet
const gscalebg = 1.0 - gscaleb // bottom percentage where graph ends

// Funktion, um den Graphen mit Pixi.js zu zeichnen
async function initGame() {

    let music = PIXI.sound.Sound.from({
        url: 'sfx/song1.mp3',
        autoPlay: true,
        complete: function() {
            console.log('Sound finished');
        }
    });
    /*let music = {
        volume: 0,
        speed: 0
    }*/

    const graphVertexShader = await loadShader('./gfx/graph.vert')
    const graphFragmentShader = await loadShader('./gfx/graph.frag')
    const ownVertexShader = await loadShader('./gfx/own.vert')
    const ownFragmentShader = await loadShader('./gfx/own.frag')
    const backgroundVertexShader = await loadShader('./gfx/background.vert')
    const backgroundFragmentShader = await loadShader('./gfx/background.frag')

    await fetchData(coins);

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
   const containerMenu = new PIXI.Container()
   let containerGraphs = new PIXI.Container()
  
   containerForeground.visible = containerBackground.visible = containerMenu.visible = false

   await Promise.all(Object.keys(coins).map(async (key) => {
    coins[key].texture = await PIXI.Assets.load({
        src: coins[key].image,
    });

    coins[key].audio = PIXI.sound.Sound.from(coins[key].sound); 
}))


let textureBtnMenu = await PIXI.Assets.load({src: 'gfx/menu.png'})
let textureBtnStop = await PIXI.Assets.load({src: 'gfx/stop.png'})
let textureBtnTrade = await PIXI.Assets.load({src: 'gfx/trade.png'})
let texturePlayer = await PIXI.Assets.load({src: 'gfx/player.png'})
let textureHodler = await PIXI.Assets.load({src: 'gfx/hodler.png'})
let textureHodlerMirror = await PIXI.Assets.load({src: 'gfx/hodler_mirror.png'})


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
        fill: '#fff'
    });

    const textStyleCentered = textStyle.clone()
    textStyleCentered.align = 'center'

    const bigtextContainer = new PIXI.Container()
    const bigTextBackground = new PIXI.Graphics()
    const bigtextLabel = new PIXI.Text('', textStyleCentered)
    bigtextLabel.anchor.set(0.5,0.5)
    bigtextContainer.addChild(bigTextBackground)
    bigtextContainer.addChild(bigtextLabel)
    const dateLabel = new PIXI.Text("", textStyle);
    containerForeground.addChild(dateLabel);
    containerForeground.addChild(bigtextContainer);

    


    bigtextContainer.hodlerSprite = new PIXI.Sprite(textureHodler)
    bigtextContainer.playerSprite = new PIXI.Sprite(texturePlayer)
    bigtextContainer.playerSprite.scale = bigtextContainer.hodlerSprite.scale = 0.075
    bigtextContainer.addChild(bigtextContainer.playerSprite, bigtextContainer.hodlerSprite)


    const stopContainer = new PIXI.Container()
    const stopLabel = new PIXI.Text("Pause", textStyleCentered);
    const stopImage = new PIXI.Sprite(textureBtnStop)
    stopLabel.anchor.set(0.5,0.5)
    stopImage.anchor.set(0.5,0.5)
    stopContainer.addChild(stopImage)
    stopContainer.addChild(stopLabel);

    const swapLabel = new PIXI.Text("Swap", textStyleCentered);
    const swapImage = new PIXI.Sprite(textureBtnTrade)
    swapLabel.anchor.set(0.5,0.5)
    swapImage.anchor.set(0.5,0.5)
    stopContainer.addChild(swapImage)
    stopContainer.addChild(swapLabel);
    containerForeground.addChild(stopContainer);

    const backgroundImage = new PIXI.Sprite({blendMode: 'screen'});
    backgroundImage.anchor.set(0.5); // Zentrieren um den Mittelpunkt



    containerBackground.addChild(backgroundImage);
    backgroundImage.rotation =  0.1;
    const coinButtonContainer = new PIXI.Container()
    let coinButtonContainerTitle = new PIXI.Text('', textStyleCentered)
    coinButtonContainerTitle.anchor.set(0.5,0.)
    coinButtonContainer.addChild(coinButtonContainerTitle)
    containerForeground.addChild(coinButtonContainer)
    const background = createBackground(backgroundVertexShader, backgroundFragmentShader);
    containerBackground.addChildAt(background,0);

    
    btnMenuSprite = new PIXI.Sprite(textureBtnMenu);
    btnMenuSprite.anchor.set(1.1,-0.1)
    containerForeground.addChild(btnMenuSprite)

    let containerGraphsForeground = new PIXI.Container()
    let graphBorder = new PIXI.Graphics()
    let graphBorderMask = new PIXI.Graphics()
    let graphBorderAreaRight = new PIXI.Graphics()
    graphBorder.cheight = 0
    graphBorder.cwidth = 0
    containerGraphsForeground.addChild(graphBorder)
    containerGraphsForeground.addChild(graphBorderAreaRight)
    let ownLabelContainer = new PIXI.Container()
    let hodlerContainer = new PIXI.Container()
    let hodlerSprite = new PIXI.Sprite(textureHodler)
    hodlerSprite.scale = 0.05
    hodlerSprite.anchor.set(0.5,0.5)
    hodlerContainer.addChild(hodlerSprite)
    let ownSprite = new PIXI.Sprite(texturePlayer)
    ownSprite.scale = 0.05
    ownSprite.anchor.set(0.5,0.5)
    let ownLabelLine =  new PIXI.Graphics()
    ownLabelLine.visible = false
    let priceLabelContainer = new PIXI.Container()
    let priceLabelLine = new PIXI.Graphics()
    //priceLabelLine.rotateTransform(45*Math.PI/180).rect(-40,-2,38,4).rotateTransform(-90*Math.PI/180).rect(-40,-2,38,4).rotateTransform(45*Math.PI/180)
    for(let i=0;i<100;i++) {
        priceLabelLine.rect(-100-20-i*25,-2,18,4)
        ownLabelLine.rect(-20-i*25,-2,18,4)
    }
    priceLabelLine.fill({color: 0xffffff,alpha:1})
    priceLabelLine.visible = false
    priceLabelContainer.addChild(priceLabelLine)
    ownLabelLine.fill({color: 0xffff00,alpha:1})
    ownLabelContainer.addChild(ownLabelLine)
    ownLabelContainer.addChild(ownSprite)
    let ownLabel = new PIXI.Text('+ 400%',textStyle)
    ownLabelContainer.addChild(ownLabel)
    ownLabel.anchor.set(1,1)
    ownLabel.x = -30

    let priceLabel = new PIXI.Text("100$", textStyle);
    let maxPriceLabel =new PIXI.Text("150$", textStyle);
    let minPriceLabel =new PIXI.Text("200$", textStyle);
    priceLabel.anchor.set(1.1,0.5)
    maxPriceLabel.anchor.set(1.1,0)
    minPriceLabel.anchor.set(1.1,1)
    priceLabelContainer.addChild(priceLabel)
    containerGraphsForeground.addChild(hodlerContainer)
    containerGraphsForeground.addChild(ownLabelContainer)
    containerGraphsForeground.addChild(priceLabelContainer)
    containerGraphsForeground.addChild(maxPriceLabel)
    containerGraphsForeground.addChild(minPriceLabel)
    ownLabel.scale = priceLabel.scale = maxPriceLabel.scale = minPriceLabel.scale = 4*0.15
 
    app.stage.addChild(containerBackground)
    app.stage.addChild(containerForeground)
    app.stage.addChild(containerMenu)


    const buyPaused = 1000
   
    const gameData = await fetchGameData(coins)
    const menu = await createMenu(gameData, app, coins, textStyle, textStyleCentered, textureHodlerMirror, texturePlayer)
    containerMenu.addChild(menu)

    function isMenuVisible() {
        return menu.visible
    }

    let localStorageCache = {}

    function setMute(value) {
        localStorageCache['mute'] = value
        localStorage.setItem('mute', value)
        if (value) {
            PIXI.sound.muteAll()
        } else {

            PIXI.sound.unmuteAll()
        }
    }

    function getMute() {
        return localStorageCache['mute'] ?? getBooleanFromLocalStorage('mute')
    }

    setMute(getMute())

    function setWin(level, value) {
        if (localStorageCache['l'+level] !== value) {
            localStorageCache['l'+level] = value
            localStorage.setItem('l'+level, value)
        }
    }

    function getWin(level) {
        return localStorageCache['l'+level] ?? getFloatFromLocalStorage('l'+level)
    }

    let options
    var maxVisiblePoints
    let fiatName
    let yourFiat
    let yourCoins
    let yourCoinName
    let paused
    let gameDurationMilliseconds
    let factorMilliSeconds
    let currentIndexFloat
    let currentIndexInteger
    let focusedCoinName
    let isMultiCoin 
    let trades = []
    let coinButtons = []
    let graphs = []
    let ownPriceData = []
    let isFinalScreen = false
    let isStopScreen = false
    let canStopManually = false
    let currentDate = null
    let stops = []
    let stopIndizes = []
    const startNewGame = (level) => {
        options = level
        stops = [...options.stops]
        stopIndizes = [...options.stopIndizes]
        maxVisiblePoints =  Math.max(7,  Math.floor((options.stopIndizes[1] - options.stopIndizes[0])*1.1))
        fiatName = Object.keys(coins)[0]
        yourFiat = options.fiatStart
        yourCoins = yourFiat
        yourCoinName = fiatName
        paused = Number.MAX_VALUE
        gameDurationMilliseconds = options.duration
        factorMilliSeconds =  (options.indexEnd - options.indexStart) / gameDurationMilliseconds; // Intervall in Sekunden
        currentIndexFloat = options.indexStart; // Zeitverfolgung
        currentIndexInteger = Math.floor(currentIndexFloat)
        focusedCoinName = null
        isMultiCoin = options.coinNames.length > 2
        canStopManually = options.canStopManually
        currentDate = null
        coinButtons.forEach(b => {
            coinButtonContainer.removeChild(b.container)
        })

        graphs.forEach(g => {
            containerGraphs.removeChild(g.graph); 
        })
      
        trades.forEach(trade => {
            containerGraphs.removeChild(trade.container); 
        })

        coinButtons = options.coinNames.map((c,i) => {
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
    
    
        coinButtons.forEach(b => {
            coinButtonContainer.addChild(b.container)
        })

        graphs = options.coinNames.filter(name => name !== fiatName).map((c,i) => {
            let container = new PIXI.Container()
            let graph = createGraph(c, graphVertexShader, graphFragmentShader, coins, textStyle, ownVertexShader, ownFragmentShader)
            container.addChild(graph)
        
            return {
                coinName: c,
                index: i,
                container: container,
                graph: graph
            }

        })
    
        graphs.forEach(g => {
            containerGraphs.addChild(g.graph); 
        })


        ownPriceData = new Array(coins['BTC'].data.length).fill(options.indexEnd)

        trades = []

    }

    startNewGame(gameData.levels.find(level => level.name === 'menu'))
 
    
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

      

     
        trade.labelPrice = new PIXI.Text(formatCurrency(trade.toName !== fiatName ? trade.toPrice : trade.fromPrice, fiatName,null, true) , textStyle)
        trade.labelPrice.anchor.set(0.5,1.5)
        trade.container.addChild(trade.labelPrice)
        if (from === to) {
            trade.labelPrice.scale.set(8*1.0)
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


    

    function getCoinButtonIndex(event) {
        return coinButtons.findIndex(b => b.container.getBounds().containsPoint(event.x,event.y))
    }
   

    app.stage.addEventListener('pointermove', (event) => {
        if (isMenuVisible()) {
            menuPointerMoveEvent(menu, event)
        } else {
            btnMenuSprite.active = btnMenuSprite.visible && btnMenuSprite.getBounds().containsPoint(event.x,event.y)
            stopImage.active = stopImage.visible && (stopImage.getBounds().containsPoint(event.x,event.y) || stopLabel.getBounds().containsPoint(event.x,event.y))
            swapImage.active = swapImage.visible && (swapImage.getBounds().containsPoint(event.x,event.y) || swapLabel.getBounds().containsPoint(event.x,event.y))
            coinButtonContainer.active = coinButtonContainer.visible && coinButtonContainer.getBounds().containsPoint(event.x,event.y)
            let trade = trades.find(t => t.index === currentIndexInteger)
          
            if (coinButtonContainer.active && !trade) {
                let i = getCoinButtonIndex(event)
                if (i >= 0 && i < coinButtons.length && coinButtons[i].active) {
                    focusedCoinName = coinButtons[i].to
                 } else {
                     focusedCoinName = null
                 }
            }

        }
        
    });


     app.stage.addEventListener('pointerup', (event) => {

        if (isMenuVisible()) {
            menuPointerUpEvent(menu, event, startNewGame,getMute, setMute)
        } else {

            if (btnMenuSprite.getBounds().containsPoint(event.x,event.y)){
                startNewGame(gameData.levels.find(level => level.name === 'menu'))
                menu.visible = true
            } else if (isFinalScreen) {
                if (yourFiat > options.fiatBTCHodler) {
                    menu.visible = true
                } else {
                    startNewGame(options)
                }
            }  else {


                btnMenuSprite.active = btnMenuSprite.visible && btnMenuSprite.getBounds().containsPoint(event.x,event.y)
                stopImage.active = stopImage.visible && (stopImage.getBounds().containsPoint(event.x,event.y) || stopLabel.getBounds().containsPoint(event.x,event.y))
                swapImage.active = swapImage.visible && (swapImage.getBounds().containsPoint(event.x,event.y) || swapLabel.getBounds().containsPoint(event.x,event.y))
                coinButtonContainer.active = coinButtonContainer.visible && coinButtonContainer.getBounds().containsPoint(event.x,event.y)
                let trade = trades.find(t => t.index === currentIndexInteger)
                if (coinButtonContainer.active && !trade) {
                    
                    let i = getCoinButtonIndex(event)
                    if (i >= 0 && i < coinButtons.length) {
                        if (focusedCoinName !== coinButtons[i].to) {
                            focusedCoinName = coinButtons[i].to
                        } else {

                            if (trades.length === 0 && yourCoinName === coinButtons[i].to) {
                                yourCoins = yourCoins / coins[coinButtons[1-i].to].data[currentIndexInteger].price
                                yourCoinName = coinButtons[1-i].to  
                            }
                            doTrade(yourCoinName,coinButtons[i].to )
                        }
                    }
                } else if ((swapImage.active || stopImage.active) && !isFinalScreen && !trade && canStopManually) {
                    stopIndizes.push(currentIndexInteger)
                    stopIndizes.sort()
                    stops.push(coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date)
                    stops.sort()
                    
                    if (swapImage.active) {
                        if (yourCoinName === coinButtons[0].to) {
                            doTrade(coinButtons[0].to, coinButtons[1].to)
                        } else {
                            doTrade(coinButtons[1].to, coinButtons[0].to)
                        }
                    }
                }
            }


           
        }

       
       
        coinButtonContainer.active = stopImage.active = swapImage.active = false

       
    })

    
    containerBackground.addChildAt(containerGraphs,2)
    containerBackground.addChild(containerGraphsForeground)

    
    containerForeground.visible = containerBackground.visible = containerMenu.visible = true
    
    menu.visible = true
    app.ticker.add((deltaTime) => {
        updateMenu(menu, app, deltaTime, getMute, getWin)


        if (isMenuVisible()) {
            containerForeground.visible = false
            paused = 0
            if (options.name !== 'menu') {
                startNewGame(gameData.levels.find(level => level.name === 'menu'))
            }
            if (trades.length < stops.length) {
                stopIndizes.forEach((stopIndex) => {
                    trades.push({
                        index: stopIndex, 
                        fromPrice: 1,
                        fromName: fiatName,
                        fromCoins: 1,
                        toPrice: 1, 
                        toName: fiatName, 
                        toCoins: 1,
                        sprite: null,
                        container: new PIXI.Container(),
                    })
                })
               
            }
        } else {
            containerForeground.visible = true
        }
        if (paused <= 0) {
            currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds;
        } else {
            paused -= deltaTime.elapsedMS
            if (paused < buyPaused) {
                currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds*(Math.max(0,(buyPaused-paused*2)/buyPaused));
            }
        }

        music.speed = paused > 0 ? Math.max(0.75,music.speed*0.9) : Math.min(1.0,music.speed*1.1)
        music.volume = paused > 0 ? Math.max(0.5,music.volume*0.9) : Math.min(1.0,music.volume*1.1)

        if (currentIndexFloat > options.indexEnd) {
            currentIndexFloat = options.indexEnd
        }
        currentIndexInteger = Math.floor(currentIndexFloat)
        let missedStopIndex = stopIndizes.findIndex(stop => stop < currentIndexInteger && !trades.find(t => t.index === stop))
        if (missedStopIndex > -1) {
            currentIndexFloat = stopIndizes[missedStopIndex]
            currentIndexInteger = Math.floor(currentIndexFloat)
        }
        let stopIndex = stopIndizes.indexOf(currentIndexInteger)
        let trade = trades.find(t => t.index === currentIndexInteger)

        maxVisiblePoints = isFinalScreen ? options.indexEnd-options.indexStart : 100
        currentDate = coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date;
        const stepX = (app.renderer.width-100) / (maxVisiblePoints-3);
        isFinalScreen = currentDate >= options.dateEnd
        isStopScreen = isFinalScreen || (stopIndizes.indexOf(currentIndexInteger) >= 0 && !trade)
        let diffCurrentIndexIntToFloat=currentIndexFloat-currentIndexInteger

        if (isMenuVisible()) {
            isStopScreen = false
            isFinalScreen = false
        }
        
        if (stopIndex > -1) {
            
            if (!trade && isFinalScreen) {
                doTrade(yourCoinName, yourCoinName)
            }
            
            if (!trade) {
                paused = Number.MAX_VALUE
            } else {
              /*  if (stopIndex < stopIndizes.length-1) {
                    maxVisiblePoints = Math.max(7, Math.floor((stopIndizes[stopIndex+1] - stopIndizes[stopIndex])*1.1))
                } else {
                    maxVisiblePoints = stopIndizes[stopIndizes.length-1] - stopIndizes[0]
                    trades.filter(t => t.index !== stopIndizes[0] && (t.index === stopIndizes[stopIndizes.length-1] || t.toName === t.fromName)).forEach(trade => {
                        trade.container.visible = false
                    })
                }*/
               
            }
        }

        //maxVisiblePoints = Math.max(20, trades.length > 1 ? currentIndexInteger - trades[trades.length-2].index : currentIndexInteger)


        if (graphBorder.cheight !== app.screen.height*gscale || graphBorder.cwidth !== app.screen.width-100) {
            graphBorder.cheight = app.screen.height*gscale
            graphBorder.cwidth = app.screen.width-100
            graphBorder.clear()
            graphBorder.rect(0,app.screen.height*gscalebg,app.screen.width,app.screen.height*(1.0-gscalebg)).fill({color: 0x4d4d4d}).rect(0, app.screen.height*gscalet, graphBorder.cwidth, graphBorder.cheight)//.stroke({color: 0xffffff, width:2})
        
            graphBorderAreaRight.position.set(app.screen.width-100,app.screen.height*gscalet)
            graphBorderAreaRight.cheight = graphBorder.cheight
            graphBorderAreaRight.cwidth = 100
            graphBorderAreaRight.clear()
            //graphBorderAreaRight.rect(-10,graphBorder.cheight-4,10,4).rect(-10,0,10,4).rect(-4,0,4,graphBorderAreaRight.cheight).fill({color: 0xffffff,alpha:1}).rect(0,0,graphBorderAreaRight.cwidth,graphBorderAreaRight.cheight).fill({color: 0x4d4d4d, alpha: 0.0})
            graphBorderAreaRight.rect(graphBorderAreaRight.cwidth-10,graphBorder.cheight-4,10,4).rect(graphBorderAreaRight.cwidth -10,0,10,4).rect(graphBorderAreaRight.cwidth -4,0,4,graphBorderAreaRight.cheight).fill({color: 0xffffff,alpha:1})
            
            minPriceLabel.position.set(app.screen.width+1, graphBorderAreaRight.position.y+graphBorderAreaRight.cheight)
            maxPriceLabel.position.set(app.screen.width+1, graphBorderAreaRight.position.y)
            priceLabelContainer.position.set(app.screen.width, graphBorderAreaRight.position.y+graphBorderAreaRight.cheight*0.5)
            
           
            graphBorderMask.clear()
            graphBorderMask.rect(0, 0, graphBorder.cwidth, app.screen.height*gscalet+graphBorder.cheight).fill({color: 0xff0000})
        
            containerGraphs.cmask = graphBorderMask
        }

        
        graphs.forEach(g => {
            let graphResult = updateGraph(g.graph, app, currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, stopIndizes.indexOf(currentIndexInteger), coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options, yourCoinName, isMenuVisible(), ownPriceData)
            
            if (options.coinNames.length < 3 || !focusedCoinName || focusedCoinName === g.graph.coinName) {
                priceLabel.text = g.graph.priceLabel.text
                priceLabelContainer.y = g.graph.priceLabel.yOriginal
                priceLabel.y = g.graph.priceLabel.y - g.graph.priceLabel.yOriginal
                minPriceLabel.text = g.graph.minPriceLabel.text
                maxPriceLabel.text = g.graph.maxPriceLabel.text

                //ownLabelContainer.mask = graphBorderMask
                ownLabelContainer.x = graphBorderAreaRight.x
                
               
                if (yourCoinName !== fiatName) {
                    ownLabelContainer.y = priceLabelContainer.y   
                    ownLabel.visible = false
                } else {
                    let ts = trades.filter(t => t.toName !== t.fromName)
                    ownLabelContainer.y = trades.length < 1 ? priceLabelContainer.y: ts[ts.length-1]?.container.getGlobalPosition().y
                    let tp = trades.length < 1 ? graphResult.price : ts[ts.length-1]?.fromPrice
                    let res = (100*(tp / graphResult.price))-100
                    if (res < 0) {
                        ownLabel.text = `- ${-res.toFixed(0)}%`
                    } else {
                        ownLabel.text = `+ ${res.toFixed(0)}%`
                    }
                    
                    ownLabel.visible = true
                }

                if (ownLabelContainer.y < graphBorderAreaRight.y) {ownLabelContainer.y = graphBorderAreaRight.y + Math.random()*10}
                if (ownLabelContainer.y > graphBorderAreaRight.y+graphBorderAreaRight.height) {ownLabelContainer.y = graphBorderAreaRight.y+graphBorderAreaRight.height - Math.random()*10}
            
                hodlerContainer.x = graphBorderAreaRight.x - 10
                hodlerContainer.y = priceLabelContainer.y

               
            }
        })


        
        let txt = ''

        txt += `Today   ${currentDate.toLocaleDateString()}\n`
        txt += `Hodler  ${formatCurrency(options.btcBTCHodler, 'BTC', coins['BTC'].digits)}\n`
        let percentageTotal = (yourCoinName === fiatName ? yourCoins : yourCoins*coins['BTC'].data[currentIndexInteger]?.price) / coins['BTC'].data[currentIndexInteger]?.price
        let res = (100*percentageTotal)-100
        if (res < 0) {
            txt += `You      ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}   (- ${-res.toFixed(0)}%)\n\n`
        } else {
            txt += `You      ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}   (+ ${res.toFixed(0)}%)\n\n`
        }

        dateLabel.text = txt
        dateLabel.visible = true
        dateLabel.position.set(app.screen.width*0.01, app.screen.height*0.005)
        dateLabel.scale.set(8*SCALE_TEXT_BASE*(Math.max(640,app.screen.width)/640.0)*0.5)

        txt = ''
        if (!isFinalScreen) { 
            if (stopIndex === 0) {
                if (!canStopManually) {
                    txt += `You will trade ${stopIndizes.length-1} ${stopIndizes.length-1 > 1 ? 'times' : 'time'} between\n${options.dateStart.toLocaleDateString()} and ${options.dateEnd.toLocaleDateString()}\n\n`
                    txt += `The trading ${stopIndizes.length-1 > 1 ? 'dates are' : 'date is'} fixed.\n\n`
                    txt += `Read the graph,\n`
                    txt += `Choose wisely and\n`
                    txt += `Beat the HODler`
                } else {
                    txt += `Level ${options.name}\n\n\n`
                    txt += `You will trade between\n${options.dateStart.toLocaleDateString()} and\n${options.dateEnd.toLocaleDateString()}\n\n`
                    txt += `Your goal is to beat\n`
                    txt += `a HODLer by trading.\n`
                    txt += `Every percent counts!\n\n`
                    txt += `You have ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}\n\n`
                    //txt += `You have 1${formatCurrency(null,options.coinNames[1])}\n\n`
                    txt += `1${formatCurrency(null,options.coinNames[1])}= ${formatCurrency(coins[options.coinNames[1]].data[currentIndexInteger]?.price, fiatName, coins[options.coinNames[0]].digits)}\n`
                    txt += `\n= YOU      \n`
                    txt += `\n = HODLER`
                }
               
            } 
        } else {
            let fiat = yourFiat 
            let res = (100*(fiat / options.fiatBTCHodler - 1))
            txt += " --- Game Over ---\n\n" 
            txt += `Level ${options.name}\n`
            if (fiat > options.fiatBTCHodler) {
                txt += "You won, nice!\n\n" 
               
                if (res > getWin(options.name)) {
                    setWin(options.name, res)
                }
            } else {
                txt += "Oh no, you lost\n\n" 
            }
    
            if (fiat > options.fiatBTCHodler) {
                txt += `You have ${res.toFixed(0)}% more\n`
                txt += `than the HODLer.\n`
                txt += `This is a new highscore!\n\n`
            } else {
                txt += `You have ${res.toFixed(0)}% less\n`
                txt += `than the HODLer.\n\n`
                txt += "Don't worry:\n" 
                txt += "HODLing is an easy way,\n" 
                txt += "to make money\n\n" 
                txt += "Try again?"
            }
          
        }
        

        bigtextContainer.visible = isFinalScreen || stopIndex === 0
        ownLabelContainer.visible = !isFinalScreen
        priceLabelContainer.visible = !isFinalScreen
        
        if (bigtextContainer.visible) {
            bigtextLabel.text = txt
            bigtextContainer.position.set(app.screen.width*0.5, app.screen.height*0.4)
            bigtextContainer.scale.set(8*0.75*SCALE_TEXT_BASE)
            bigTextBackground.clear()
            bigTextBackground.rect(-bigtextLabel.width/2, -bigtextLabel.height/2, bigtextLabel.width, bigtextLabel.height).fill(0x4d4d4d).stroke({color: 0xffffff, width: 2})
            bigTextBackground.scale = 1.1

            if (stopIndex === 0) {
                bigtextContainer.playerSprite.x = -0.6*bigtextContainer.width
                bigtextContainer.hodlerSprite.x = -0.6*bigtextContainer.width
                bigtextContainer.playerSprite.y = 0.52*bigtextContainer.height
                bigtextContainer.hodlerSprite.y = 0.7*bigtextContainer.height
                
            } else {
                bigtextContainer.hodlerSprite.x = bigtextContainer.playerSprite.x = app.screen.width*2
            }
            //hodlerContainer.x = bigtextContainer.x + bigtextContainer.width*0.5
           // hodlerContainer.y = bigtextContainer.y + bigtextContainer.height
        }
       


        swapLabel.scale = stopLabel.scale = 8*0.75*SCALE_TEXT_BASE
        coinButtonContainerTitle.scale.set(8*0.75*SCALE_TEXT_BASE)

        let color = hexToRGB(coins[yourCoinName].color, 1.0)
        if (isMenuVisible()) {
            color = hexToRGB(coins['BTC'].color, 1.0)
        }
        background.shader.resources.backgroundUniforms.uniforms.uR = color[0];
        background.shader.resources.backgroundUniforms.uniforms.uG = color[1];
        background.shader.resources.backgroundUniforms.uniforms.uB = color[2];
        background.shader.resources.backgroundUniforms.uniforms.uA = color[3];
        
        background.shader.resources.backgroundUniforms.uniforms.uTime = deltaTime.lastTime
        background.shader.resources.backgroundUniforms.uniforms.uPercentage = (currentIndexFloat-options.indexStart) / (options.indexEnd - options.indexStart)

        
        //coinButtonContainerTitle.text = deltaTime.lastTime % 4000 > 2000 ? `Trade ${stopIndex+1}/${stops.length-1}` : 'What do you want ?' 
        
        if (canStopManually) {
            coinButtonContainerTitle.text = `What do you want ?` 
        } else {
            coinButtonContainerTitle.text = `Trade ${stopIndex+1}/${stops.length-1}\nWhat do you want ?` 
        }
       
        coinButtons.forEach(b => {
            b.active = !coins[b.to].data || coins[b.to].data[currentIndexInteger]?.price ? true : false
        })


        coinButtonContainer.y = gscalebg*app.renderer.height
        coinButtonContainer.cheight = app.renderer.height-coinButtonContainer.y
        coinButtonContainerTitle.x =app.renderer.width*0.5 
        coinButtonContainerTitle.y = coinButtonContainer.cheight*1.0/3.0
        coinButtonContainerTitle.rotation = Math.sin(deltaTime.lastTime*0.005)*0.05
        let maxButtonHeight = 0
        coinButtons.forEach(b => {
            b.sprite.height = b.sprite.width = (focusedCoinName && b.to === focusedCoinName ? 1.1 : 1.0)*(1.0/3.0) * coinButtonContainer.cheight
            b.container.x = (app.renderer.width / coinButtons.length)*(b.index+0.5)
            b.container.y = 2.0/3.0 * coinButtonContainer.cheight
            b.sprite.rotation = focusedCoinName && b.to === focusedCoinName ? Math.sin(deltaTime.lastTime*0.01- (1000/coinButtons.length)*b.index)*0.1 : 0.0
            b.sprite.alpha = 1
            b.sprite.alpha = (!coins[b.to].csv || b.active) ? b.sprite.alpha : 0.0
            maxButtonHeight = Math.max(maxButtonHeight, b.sprite.height)
           
        })
        stopContainer.y = coinButtonContainer.y
        stopImage.height = stopImage.width = (stopImage.active ? 1.1 : 1.0) * (1.0/3.0) * coinButtonContainer.cheight
        swapImage.height = swapImage.width = (swapImage.active ? 1.1 : 1.0) * (1.0/3.0) * coinButtonContainer.cheight
        //swapImage.tint = coins[(yourCoinName === coinButtons[0].to ? coinButtons[1].to : coinButtons[0].to)].colorInt
        
        swapLabel.text = (yourCoinName === coinButtons[0].to ? 'Buy' : 'Sell')
        //swapImage.texture = coins[coinButtons[1].to].texture
        swapImage.texture = coins[(yourCoinName === coinButtons[0].to ? coinButtons[1].to : coinButtons[0].to)].texture
        stopImage.position.set(app.renderer.width*0.25, 2.0/3.0 * coinButtonContainer.cheight)
        stopLabel.position.set(app.renderer.width*0.25, 2.0/3.0 * coinButtonContainer.cheight-stopImage.height*0.75)
        
        swapImage.position.set(app.renderer.width*0.75, 2.0/3.0 * coinButtonContainer.cheight)
        swapLabel.position.set(app.renderer.width*0.75, 2.0/3.0 * coinButtonContainer.cheight-swapImage.height*0.75)
        
        //stopLabel.rotation =Math.sin(deltaTime.lastTime*0.01)*0.01
        //stopContainer.scale=((stopContainer.active ? 0.2 : 0.0) + 1+Math.cos(deltaTime.lastTime*0.01)*0.01)
        

        if (stopIndex > -1 && !isFinalScreen && !trade) {
            if (focusedCoinName) {
                let fromPrice = yourCoinName === fiatName ? 1 : coins[yourCoinName].data[currentIndexInteger].price
                let toPrice = focusedCoinName === fiatName ? 1 : coins[focusedCoinName].data[currentIndexInteger].price
                let toCoins = (yourCoins * fromPrice) / toPrice
                if (canStopManually) {
                    coinButtonContainerTitle.text = `Please confirm: \n` + formatCurrency(toCoins, focusedCoinName, coins[focusedCoinName].digits)
                } else {
                    coinButtonContainerTitle.text = `Trade ${stopIndex+1}/${stops.length-1}\nPlease confirm: \n` + formatCurrency(toCoins, focusedCoinName, coins[focusedCoinName].digits)
                }
            }
        } else {
            coinButtonContainerTitle.text = ''
        }

        stopContainer.visible =  !isFinalScreen  && stopIndex < 0
        coinButtonContainer.visible = !isFinalScreen && !stopContainer.visible && stopIndex > -1 && !trade

        if (isStopScreen && (stopIndex === 0 || isFinalScreen)) {
            //containerGraphs.visible = false
            backgroundImage.visible = false
           // dateLabel.fontStyle = textStyleCentered
            //dateLabel.position.set(0.5*app.screen.width, 0.5*app.screen.height)
            //dateLabel.anchor.set(0.5,0.5)
        } else {
            //containerGraphs.visible = true
            backgroundImage.visible = true
            //dateLabel.anchor.set(0.0,0.0)
        }
        btnMenuSprite.scale = 0.3*(Math.max(640,app.screen.width)/640.0)*0.5
        btnMenuSprite.alpha = (btnMenuSprite.active ? 1.0 : 0.7)
        btnMenuSprite.position.set(app.screen.width, app.screen.height*0 )
       
        backgroundImage.texture = isMenuVisible() ? coins['BTC'].texture : coins[yourCoinName].texture

        backgroundImage.scale.set(0.2*(Math.min(app.screen.width,1080)/1080))
        backgroundImage.alpha = 1;
        backgroundImage.x = app.renderer.width-100-backgroundImage.width*1 + Math.sin(deltaTime.lastTime*0.0001)*0.1*(app.renderer.width-100);
        backgroundImage.y = app.renderer.height*0.3 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;

        if (isMenuVisible()){
           // containerGraphs.position.set(-diffCurrentIndexIntToFloat*stepX,gscaleb*app.screen.height)
           backgroundImage.y += (1.0-gscalebg)*app.screen.height
           containerGraphs.position.set(100-diffCurrentIndexIntToFloat*stepX,(1.0-gscalebg)*app.screen.height)
            graphBorder.visible = false
            containerGraphsForeground.visible = false
            containerGraphs.mask = null
           // backgroundImage.y = app.renderer.height*0.6 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;
       
        } else {
           /* containerGraphs.position.set(-diffCurrentIndexIntToFloat*stepX,0.0)
            graphBorder.visible = true
            backgroundImage.texture = isMenuVisible() ? coins['BTC'].texture : coins[yourCoinName].texture
            backgroundImage.x = app.renderer.width*0.5 + Math.sin(deltaTime.lastTime*0.0001)*app.renderer.width / 16;
            backgroundImage.y = app.renderer.height*0.5 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;
            */

            containerGraphs.mask = containerGraphs.cmask
            containerGraphsForeground.visible = true
            //containerGraphs.scale = 0.9
            containerGraphs.position.set(-stepX*containerGraphs.scale.x-diffCurrentIndexIntToFloat*stepX,0.0)
         
            graphBorder.visible = true
            //graphBorder.position.set(0,0) 
         
           
        }       

    });
}

window.addEventListener("load", (event) => {
    initGame();
})
