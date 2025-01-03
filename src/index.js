const coins = {
    USD: { color: '#85BB65', image: './gfx/usd.png', currency: 'USD', sound: 'sfx/usd.wav', csv: null, data: null, audio: null, texture: null, digits: 2},
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
    const backgroundVertexShader = await loadShader('./gfx/background.vert')
    const backgroundFragmentShader = await loadShader('./gfx/background.frag')

    await fetchData(coins);

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xf4b400,
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
   const containerMenu = new PIXI.Container()
   let containerGraphs = new PIXI.Container()

   app.stage.addChild(containerBackground)
   app.stage.addChild(containerForeground)
   app.stage.addChild(containerMenu)

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

        coins[key].audio = PIXI.sound.Sound.from(coins[key].sound); 
    }))


    let textureBtnMenu = await PIXI.Assets.load({src: 'gfx/menu.png'})
    let textureBtnTrade = await PIXI.Assets.load({src: 'gfx/trade.png'})

    const stackContainer = new PIXI.Container()
    const stackLabel = new PIXI.Text("", textStyleCentered);
    const stackImage = new PIXI.Sprite(textureBtnTrade)
    stackLabel.anchor.set(0.5,0.5)
    stackImage.anchor.set(0.5,0.5)
    stackLabel.text = "Click to stop"
    stackContainer.addChild(stackImage)
    stackContainer.addChild(stackLabel);

    containerForeground.addChild(stackContainer);

    const backgroundImage = new PIXI.Sprite();
    backgroundImage.anchor.set(0.5); // Zentrieren um den Mittelpunkt
    containerBackground.addChild(backgroundImage);
    backgroundImage.rotation =  0.1;
    backgroundImage.alpha = 0.1;
    const coinButtonContainer = new PIXI.Container()
    let coinButtonContainerTitle = new PIXI.Text('', textStyleCentered)
    coinButtonContainerTitle.anchor.set(0.5,0.)
    coinButtonContainer.addChild(coinButtonContainerTitle)
    containerForeground.addChild(coinButtonContainer)
    const background = createBackground(backgroundVertexShader, backgroundFragmentShader);
    background.position.set(0, 0);       
    containerBackground.addChildAt(background,0);

    
    btnMenuSprite = new PIXI.Sprite(textureBtnMenu);
    btnMenuSprite.anchor.set(1.1,-0.1)
    containerForeground.addChild(btnMenuSprite)


    const buyPaused = 1000
   
    const gameData = await fetchGameData(coins)
    const menu = await createMenu(gameData, app, coins, textStyle, textStyleCentered)
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

    function setWin(level) {
        if (localStorageCache['l'+level] !== true) {
            localStorageCache['l'+level] = true
            localStorage.setItem('l'+level, true)
        }
    }

    function getWin(level) {
        return localStorageCache['l'+level] ?? localStorage.getItem('l'+level)
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
    let isFinalScreen = false
    let isStopScreen = false
    let canStopManually = false
    let currentDate = null
    const startNewGame = (level) => {
        options = level
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
            containerGraphs.addChild(g.graph); 
        })

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
        if (isMenuVisible()) {
            menuPointerMoveEvent(menu, event)
        } else {
            let trade = trades.find(t => t.index === currentIndexInteger)
            let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
        
            if (stopIndex > -1 && !isFinalScreen && !trade) {
                let i = getCoinButtonIndex(event)
                if (i >= 0 && i < coinButtons.length && coinButtons[i].active) {
                    focusedCoinName = coinButtons[i].to
                 } else {
                     focusedCoinName = null
                 }
            }

            btnMenuSprite.active = btnMenuSprite.getBounds().containsPoint(event.x,event.y)
            stackContainer.active = stackContainer.getBounds().containsPoint(event.x,event.y)
        }
        
    });


     app.stage.addEventListener('pointerup', (event) => {

        if (isMenuVisible()) {
            menuPointerUpEvent(menu, event, startNewGame,getMute, setMute)
        } else {
            if (btnMenuSprite.getBounds().containsPoint(event.x,event.y)){
                menu.visible = true
            } else if (isFinalScreen) {
                if (yourFiat > options.fiatBTCHodler) {
                    menu.visible = true
                } else {
                    startNewGame(options)
                }
            }  else {
                

                let trade = trades.find(t => t.index === currentIndexInteger)
                let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
                if (stopIndex > -1 && !isFinalScreen  && !trade) {
                    let i = getCoinButtonIndex(event)
                    if (i >= 0 && i < coinButtons.length) {
                        if (focusedCoinName !== coinButtons[i].to) {
                            focusedCoinName = coinButtons[i].to
                        } else {
                            doTrade(yourCoinName,coinButtons[i].to )
                        }
                    }
                } else if (stopIndex === -1  && !trade && canStopManually) {
                    options.stopIndizes.push(currentIndexInteger)
                    options.stopIndizes.sort()
                    options.stops.push(coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date)
                    options.stops.sort()
                }
            }


           
        }

       
       

       
    })

    
    containerBackground.addChildAt(containerGraphs,1)
    app.ticker.add((deltaTime) => {
        updateMenu(menu, app, deltaTime, getMute, getWin)


        if (isMenuVisible()) {
            containerForeground.visible = false
            paused = 0
            if (options.name !== 'menu') {
                startNewGame(gameData.levels.find(level => level.name === 'menu'))
            }
            if (trades.length < options.stops.length) {
                options.stopIndizes.forEach((stopIndex) => {
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
        let missedStopIndex = options.stopIndizes.findIndex(stop => stop < currentIndexInteger && !trades.find(t => t.index === stop))
        if (missedStopIndex > -1) {
            currentIndexFloat = options.stopIndizes[missedStopIndex]
            currentIndexInteger = Math.floor(currentIndexFloat)
        }
        let stopIndex = options.stopIndizes.indexOf(currentIndexInteger)
        let trade = trades.find(t => t.index === currentIndexInteger)

        maxVisiblePoints = 100
        currentDate = coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date;
        const stepX = app.renderer.width / (maxVisiblePoints-1) * 0.9;
        isFinalScreen = currentDate >= options.dateEnd
        isStopScreen = isFinalScreen || (options.stopIndizes.indexOf(currentIndexInteger) >= 0 && !trade)
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
              /*  if (stopIndex < options.stopIndizes.length-1) {
                    maxVisiblePoints = Math.max(7, Math.floor((options.stopIndizes[stopIndex+1] - options.stopIndizes[stopIndex])*1.1))
                } else {
                    maxVisiblePoints = options.stopIndizes[options.stopIndizes.length-1] - options.stopIndizes[0]
                    trades.filter(t => t.index !== options.stopIndizes[0] && (t.index === options.stopIndizes[options.stopIndizes.length-1] || t.toName === t.fromName)).forEach(trade => {
                        trade.container.visible = false
                    })
                }*/
               
            }
        }

        //maxVisiblePoints = Math.max(20, trades.length > 1 ? currentIndexInteger - trades[trades.length-2].index : currentIndexInteger)

        containerGraphs.position.set(-diffCurrentIndexIntToFloat*stepX,0)


        graphs.forEach(g => {
            updateGraph(g.graph, app, currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, options.stopIndizes.indexOf(currentIndexInteger), coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options, yourCoinName, isMenuVisible())
        })
        
        let txt = ''

        if (!isFinalScreen) {
            
            
           
        
            if (stopIndex === 0) {
                
                if (!canStopManually) {
                    txt += `You will trade ${options.stopIndizes.length-1} ${options.stopIndizes.length-1 > 1 ? 'times' : 'time'} between\n${options.dateStart.toLocaleDateString()} and ${options.dateEnd.toLocaleDateString()}\n\n`
                    
                    txt += `The trading ${options.stopIndizes.length-1 > 1 ? 'dates are' : 'date is'} fixed.\n\n`
                    txt += `Read the graph,\n`
                    txt += `Choose wisely and\n`
                    txt += `Beat the HODler`
                } else {
                    txt += `Today   ${currentDate.toLocaleDateString()}\n`
                    txt += `Hodler  ${formatCurrency(options.btcBTCHodler, 'BTC', coins['BTC'].digits)}\n`
                    txt += `You      ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}\n\n`
                    txt += `You will play between\n${options.dateStart.toLocaleDateString()} and\n${options.dateEnd.toLocaleDateString()}\n\n`
                    txt += `Your goal is to beat the HODLer!\n`
                    txt += `Good luck!\n\n`
                  
                }
               
            }  else {
                txt += `Today  ${currentDate.toLocaleDateString()}\n`
                txt += `Hodler ${formatCurrency(options.btcBTCHodler, 'BTC', coins['BTC'].digits)}\n`
                txt += `You     ${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}`
                    if (yourCoinName !== fiatName) {
                        txt += '\n= '+ formatCurrency(yourCoins*coins[yourCoinName].data[currentIndexInteger].price, fiatName,null, true)+""
                    } else {
                        txt += '\n= '+ formatCurrency(yourFiat / coins['BTC'].data[currentIndexInteger].price, 'BTC')+""
                    }
                    
            }


        } else {
            let fiat = yourFiat 
            
            txt += " --- Game Over ---\n\n" 
            if (fiat > options.fiatBTCHodler) {
                txt += "You won, nice!\n\n" 
                setWin(options.name)
            } else {
                txt += "Oh no, you lost\n\n" 
            }

           // txt += `Today is ${options.dateEnd.toLocaleDateString()}\n\n`
            txt += `Hodler ${formatCurrency(options.btcBTCHodler, 'BTC')} `
            txt += '= '+ formatCurrency(options.fiatBTCHodler, fiatName, options.fiatBTCHodler >= 1000 ? 0 : 2) +"\n"
            txt += `You     ${formatCurrency(fiat / coins['BTC'].data[currentIndexInteger].price, 'BTC')} `
            txt += '= '+ formatCurrency(fiat, fiatName, fiat >= 1000 ? 0 : 2) +"\n\n"
            
            

           
           
            if (fiat > options.fiatBTCHodler) {
                txt += `You have ${(100*(fiat / options.fiatBTCHodler - 1)).toFixed(2)}% more\n`
                txt += `This is a new highscore!\n\n`
                txt += `Try the next level?!\n`
            } else {
                txt += `You have ${(100*(1-fiat / options.fiatBTCHodler )).toFixed(2)}% less\n`
                txt += "You have to make more than him\n\n" 
                txt += "Try again?"
            }
          
        }

        dateLabel.text = txt
        dateLabel.visible = true

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyleCentered.fontSize =  textStyle.fontSize = Math.max(18, (Math.max(app.renderer.height, app.renderer.width) / 1080)*18)
        textStyleCentered.stroke.width = textStyle.stroke.width = textStyle.fontSize*0.2
        background.shader.resources.backgroundUniforms.uniforms.uColor = [1.0,0.0,0.0,1.0];//hexToRGB(coins[yourCoinName].color, 1.0)
        background.shader.resources.backgroundUniforms.uniforms.uTime = deltaTime.lastTime
        backgroundImage.texture = isMenuVisible() ? coins['BTC'].texture : coins[yourCoinName].texture
        backgroundImage.x = app.renderer.width / 2 + Math.sin(deltaTime.lastTime*0.0001)*app.renderer.width / 16;
        backgroundImage.y = app.renderer.height / 2 + Math.cos(deltaTime.lastTime*0.0001)*app.renderer.height / 16;
        backgroundImage.scale = 2.0 + Math.sin(deltaTime.lastTime*0.0001)
        
        //coinButtonContainerTitle.text = deltaTime.lastTime % 4000 > 2000 ? `Trade ${stopIndex+1}/${options.stops.length-1}` : 'What do you want ?' 
        
        if (canStopManually) {
            coinButtonContainerTitle.text = `What do you want ?` 
        } else {
            coinButtonContainerTitle.text = `Trade ${stopIndex+1}/${options.stops.length-1}\nWhat do you want ?` 
        }
       
        coinButtons.forEach(b => {
            b.active = !coins[b.to].data || coins[b.to].data[currentIndexInteger]?.price ? true : false
        })
        if (stopIndex > -1 && !isFinalScreen && !trade) {
            if (focusedCoinName) {

                let fromPrice = yourCoinName === fiatName ? 1 : coins[yourCoinName].data[currentIndexInteger].price
                let toPrice = focusedCoinName === fiatName ? 1 : coins[focusedCoinName].data[currentIndexInteger].price

                let toCoins = (yourCoins * fromPrice) / toPrice
       
                if (canStopManually) {
                    coinButtonContainerTitle.text = `Please confirm: \n` + formatCurrency(toCoins, focusedCoinName, coins[focusedCoinName].digits)
                } else {
                    coinButtonContainerTitle.text = `Trade ${stopIndex+1}/${options.stops.length-1}\nPlease confirm: \n` + formatCurrency(toCoins, focusedCoinName, coins[focusedCoinName].digits)
                }
            }
            

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
            stackContainer.visible = false
        } else {
            coinButtonContainer.visible = false 
            stackContainer.visible = !isFinalScreen  && trades.length > 0 && trades[trades.length-1].index < currentIndexInteger - maxVisiblePoints / 30
            stackContainer.alpha = !isFinalScreen && trades.length > 0 && Math.min(1.0, (currentIndexInteger - maxVisiblePoints / 30.0) / 8)

            stackImage.height = stackImage.width = Math.max(32,app.renderer.width*0.04)
            stackContainer.position.set(0.5*app.renderer.width, 0.8*app.renderer.height)
            stackLabel.position.set(0, stackImage.height)
            stackLabel.rotation =Math.sin(deltaTime.lastTime*0.01)*0.01
            stackContainer.scale=(stackContainer.active ? 0.2 : 0.0) + 1+Math.cos(deltaTime.lastTime*0.01)*0.01
            
            focusedCoinName = null
        }


        btnMenuSprite.scale = 0.15
        btnMenuSprite.alpha = (btnMenuSprite.active ? 1.0 : 0.7)
        btnMenuSprite.position.set(app.screen.width, 0 )
       
    });
}

window.addEventListener("load", (event) => {
    initGame();
})
