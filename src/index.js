const hodlerActivities = [
    "slept", "read a book", "went hiking", "learned to cook", "meditated", "spent time with family", "played guitar", "watched the stars", "tended his garden", "took a road trip", "painted a masterpiece", "built a birdhouse", "wrote poetry", "practiced yoga", "volunteered at a shelter", "explored nature", "mastered a new skill", "relaxed by the beach", "baked fresh bread", "planned his future", "created art", "danced in the rain", "laughed with friends",
    "enjoyed a sunset", "wrote a journal", "went birdwatching", "visited a museum", "rode a bicycle", "crafted furniture", "hosted a dinner party", "learned a new language", "explored a new city", "practiced mindfulness", "played chess", "watched a documentary", "went camping", "played with his pet", "studied philosophy", "planted trees", "designed a website", "built a puzzle", "ran a marathon", "taught a class", "organized his home", "wrote a novel", "restored old furniture", "enjoyed silence", "tried a new sport", "sketched in a notebook", "joined a community event",
    "fixed his car", "started a podcast", "climbed a mountain", "crafted a sculpture", "had a picnic", "explored a cave", "stargazed in the desert", "learned calligraphy", "collected rare coins", "created a time capsule", "watched a play", "learned woodworking", "decorated his home", "took photographs", "attended a workshop", "kayaked on a river", "tried rock climbing", "visited a farm", "wrote a screenplay", "danced at home", "created digital art", "tried new recipes", "observed wildlife", "mentored someone", "researched history", "built a greenhouse", "read ancient texts", "sewed a quilt", "rested in a hammock", "practiced a musical instrument", "trained for a triathlon", "sang karaoke", "taught his children", "designed a garden", "ran a charity event", "binge-watched his favorite series", "bought local crafts", "read poetry aloud", "wrote thank-you notes", "crafted a scrapbook", "went fishing", "practiced tai chi", "restored a classic car", "learned to dance", "watched a sunrise", "explored an abandoned building", "read about astronomy", "helped a neighbor", "attended a retreat", "designed a board game", "hosted a movie night", "planted flowers", "listened to classical music", "trained a dog", "tried pottery", "wrote a blog", "played board games", "visited a library", "disconnected from technology"
];

const coins = {
    USD: { color: '#85BB65', colorInt: 0x85BB65, image: 'usd.png', currency: 'USD', sound: 'sfx/usd.wav', csv: null, data: null, audio: null, texture: null, digits: 2},
    BTC: { color: '#F7931B', colorInt: 0xF7931B,image: 'btc.png', currency: 'BTC', sound: 'sfx/btc.wav', csv: 'data/btc-usd-max.csv',  digits: 8}
/*    ADA: { color: '#0133AD', colorInt: 0x0133AD,image: './gfx/ada.png', currency: 'ADA', sound: 'sfx/btc.wav', csv: 'data/ada-usd-max.csv',  digits: 2},
    DOGE: { color: '#BA9F32', colorInt: 0xBA9F325,image: './gfx/doge.png', currency: 'D', sound: 'sfx/btc.wav', csv: 'data/doge-usd-max.csv',  digits: 2},
    ETH: { color: '#383938', colorInt: 0x383938,image: './gfx/eth.png', currency: 'ETH', sound: 'sfx/btc.wav', csv: 'data/eth-usd-max.csv',  digits: 2},
    SOL: { color: '#BD3EF3', colorInt: 0xBD3EF3,image: './gfx/sol.png', currency: 'SOL', sound: 'sfx/btc.wav', csv: 'data/sol-usd-max.csv',  digits: 2},
*/}

const SCALE_TEXT_BASE = 1.0/16.0*1.5
const gscalet = 0.25 // how much screen height space on top
const gscale = 0.5 // how much screen height does the graph take
const gscaleb = 1.0 - gscale - gscalet // how much screen height does the bottom menu take
const gscalebg = 1.0 - gscaleb // bottom in absolute percentage where graph ends

const durationMinFinalScreen = 1500

class CoinApplication extends PIXI.Application {
    constructor(options) {
        super(options)

        this.containerGame = new PIXI.Container()
        this.containerLoading = new PIXI.Container()
    }

    async init(options) {
        await super.init(options)   
        document.body.appendChild(this.canvas);
        this.stage.addChild(this.containerGame, this.containerLoading)

        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Xolonium',
            fontStyle: 'Bold',
            fontSize: 64,
            fill: '#fff',
            wordWrap: false,
            wordWrapWidth: 440,
        });
    

        this.containerLoading.bar = new PIXI.Graphics() 
        this.containerLoading.title = new PIXI.Text({text: 'Beat the HODLer', style: textStyle})
        this.containerLoading.text = new PIXI.Text({text: 'aaa', style: textStyle})
        this.containerLoading.title.anchor.set(0.5,0.0)
        this.containerLoading.text.anchor.set(0.5,-2.0)
        this.containerLoading.addChild(this.containerLoading.bar, this.containerLoading.title, this.containerLoading.text)
        this.containerGame.visible = false
        this.containerLoading.visible = true
        this.ticker.add(this.onUpdateLoader, this)
    }

    onUpdateLoader(ticker) {
        let scaleToFullHD = this.screen.width/1920
        this.containerLoading.bar.position.set(this.screen.width*0.5, this.screen.height*0.8)
        this.containerLoading.text.position.set(this.screen.width*0.5, this.screen.height*0.6)
        this.containerLoading.title.position.set(this.screen.width*0.5, this.screen.height*0.1)
        this.containerLoading.title.scale.set(4*scaleToFullHD*0.5)
        
        this.containerLoading.text.position.set(this.screen.width*0.5, this.screen.height*0.15)
        this.containerLoading.text.scale.set(4*Math.min(0.5,scaleToFullHD)*0.25)
        this.containerLoading.bar.scale = 0.99+0.01*Math.sin(ticker.lastTime*0.01)
        this.containerLoading.bar.clear()
        this.containerLoading.bar.rect(-this.screen.width*0.25, -this.screen.height*0.05, this.screen.width*0.5, this.screen.height*0.1).stroke({color: 0xffffff, width: this.screen.height*0.01, alpha:1.0}).rect(-this.screen.width*0.25, -this.screen.height*0.05, this.screen.width*0.5*this.containerLoading.percentage, this.screen.height*0.1).fill();
    }


    setLoading(percentage, text = '') {
        this.containerLoading.percentage = percentage
        if (text !== undefined)
            this.containerLoading.text.text = text
        this.render()
    }

    finishLoading() {
        this.ticker.remove(this.onUpdateLoader, this)
        this.containerGame.visible = true
        this.containerLoading.visible = false
    }

}

// Funktion, um den Graphen mit Pixi.js zu zeichnen
async function initGame() {

    
    const app = new CoinApplication();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xf4b400,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window
    });


    app.setLoading(0.0, 'Loading fonts')

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



    app.setLoading(0.2, 'Loading shaders')

    
    const [graphVertexShader, 
        graphFragmentShader, 
        ownVertexShader, 
        ownFragmentShader, 
        backgroundVertexShader, 
        backgroundFragmentShader,
        sunVertexShader, 
        sunFragmentShader,
        data] = await Promise.all(
        [loadShader('./gfx/graph.vert'), 
        loadShader('./gfx/graph.frag'),
        loadShader('./gfx/own.vert'), 
        loadShader('./gfx/own.frag'), 
        loadShader('./gfx/background.vert'), 
        loadShader('./gfx/background.frag'),
        loadShader('./gfx/sun.vert'), 
        loadShader('./gfx/sun.frag'),
        fetchData(coins)]
    )


    app.setLoading(0.4, 'Loading graphics')

    const spriteSheet = await PIXI.Assets.load('gfx/texturepack.json');

    const [
        textureWhiteCoin,
        textureSpeedNormal,
        textureSpeedFast, 
        textureBtnMenu,
        textureBtnStop,
        textureBtnPlay,
        textureBtnTrade,
        texturePlayer,
        textureHodler,
        textureHodlerMirror,
        textureCloud,
        audioOnTexture,
        audioOffTexture,
        musicOnTexture,
        musicOffTexture,
        helpTexture    
    ] = [
        spriteSheet.textures['white.png'],
         spriteSheet.textures['normal.png'],
         spriteSheet.textures['fast.png'],
         spriteSheet.textures['menu.png'],
         spriteSheet.textures['stop.png'],
         spriteSheet.textures['play.png'],
        spriteSheet.textures['trade.png'],
         spriteSheet.textures['player.png'],
         spriteSheet.textures['hodler.png'],
         spriteSheet.textures['hodler_mirror.png'],
         spriteSheet.textures['cloud.png'],
         spriteSheet.textures['audio_on.png'],
         spriteSheet.textures['audio_off.png'],
         spriteSheet.textures['music_on.png'],
         spriteSheet.textures['music_off.png'],
         spriteSheet.textures['help.png']
    ]
    Object.keys(coins).map(async (key) => {
        coins[key].texture =  spriteSheet.textures[coins[key].image]
    })



    app.setLoading(0.7, 'Loading sounds')
  
    SoundManager.initSafe(app)
    Promise.all(Object.keys(coins).map(async (key) => {
        SoundManager.add(key,coins[key].sound )
    }))
    SoundManager.add([
        {name: 'music_menu', url: 'sfx/song1.mp3'},
        {name: 'music_game1', url: 'sfx/song2.mp3'},
        {name: 'music_about', url: 'sfx/song3.mp3'},
        {name: 'trade_won1', url: 'sfx/coin1.wav'},
        {name: 'trade_won2', url: 'sfx/coin2.wav'},
        {name: 'trade_won3', url: 'sfx/coin3.wav'},
        {name: 'trade_won4', url: 'sfx/coin4.wav'},
        {name: 'trade_won5', url: 'sfx/coin5.wav'},
        {name: 'trade_lost1', url: 'sfx/lost1.wav'},
        {name: 'trade_lost2', url: 'sfx/lost2.wav'},
        {name: 'trade_lost3', url: 'sfx/lost3.wav'},
        {name: 'trade_lost4', url: 'sfx/lost4.wav'},
        {name: 'trade_lost5', url: 'sfx/lost5.wav'},
        {name: 'shepard_up', url: 'sfx/ascending-tones-168471.mp3'},
        {name: 'shepard_down', url: 'sfx/descending-tones-168472.mp3'},
        {name: 'game_lost', url: 'sfx/8-bit-video-game-lose-sound-version-1-145828.mp3'},
        {name: 'game_won', url:  'sfx/brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3'}
    ])
        
    app.canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });/*
    app.canvas.addEventListener('touchstart', (e) => {
     //   e.preventDefault();
    });*/


    app.stage.eventMode = 'static'
    app.stage.hitArea = app.screen

    let shepardSoundUp
    let shepardSoundDown

   const containerForeground = new PIXI.Container()
   const containerBackground = new PIXI.Container()
   const containerMenu = new PIXI.Container()
   let containerGraphs = new PIXI.Container()
  
   containerForeground.visible = containerBackground.visible = containerMenu.visible = false

    
    app.setLoading(0.9, 'Initializing game')

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 32,
        fill: '#fff'
    });

    const textStyleCentered = textStyle.clone()
    textStyleCentered.align = 'center'

    const textStyleBorder = textStyle.clone()
    textStyleBorder.stroke = {color: '#000000', width: 3}

    const textStyleCenteredBlack = textStyleCentered.clone()
    textStyleCenteredBlack.fill = '#000'
    textStyleCenteredBlack.stroke = {color: '#ffffff', width: 3}
   
    let graphBorder = new PIXI.Graphics()
    let graphBorderMask = new PIXI.Graphics()
    let graphBorderAreaRight = new PIXI.Graphics()
    graphBorder.cheight = 0
    graphBorder.cwidth = 0
    const bigtextContainer = new PIXI.Container()
    bigtextContainer.active = false
    bigtextContainer.visible = false

    const bigTextBackground = new PIXI.Graphics().circle(0, 0, 1).fill({color: 0xffffff,alpha:0.0})
    const bigtextLabel = new PIXI.Text({text: '', style: textStyleCenteredBlack})
    bigtextLabel.anchor.set(0.5,0.5)
    bigtextContainer.addChild(bigTextBackground)
    bigtextContainer.addChild(bigtextLabel)
    const dateLabel = new PIXI.Text({text: '', style: textStyle});
    containerForeground.addChild(dateLabel);
    containerForeground.addChild(bigtextContainer);

    let bigTextLayer = new PIXI.RenderLayer({sortableChildren: true})


    const stopContainer = new PIXI.Container()
    const stopLabel = new PIXI.Text({text: "Pause", style: textStyleCentered} );
    const stopImage = new PIXI.Sprite(textureBtnStop)
    stopLabel.anchor.set(0.5,0.5)
    stopImage.anchor.set(0.5,0.5)
    stopContainer.addChild(stopImage)
    stopContainer.addChild(stopLabel);

    const swapLabel = new PIXI.Text({text: "Swap", style: textStyleCentered});
    const swapImage = new PIXI.Sprite(textureBtnTrade)
    swapLabel.anchor.set(0.5,0.5)
    swapImage.anchor.set(0.5,0.5)
    stopContainer.addChild(swapImage)
    stopContainer.addChild(swapLabel);
    containerForeground.addChild(stopContainer);

    const backgroundImage = new PIXI.Sprite(); //screen
    backgroundImage.anchor.set(0.5); // Zentrieren um den Mittelpunkt
    backgroundImage.scaleWanted = 0.8
    backgroundImage.scale = 0.8
    
    backgroundImage.filters = getSunFilter(sunVertexShader, sunFragmentShader);


    containerBackground.addChild(backgroundImage);
    backgroundImage.rotation =  0.1;
    const background = createBackground(backgroundVertexShader, backgroundFragmentShader);
    containerBackground.addChildAt(background,0);
   

    let btnMenuSprite = new PIXI.Sprite(textureBtnMenu);
    btnMenuSprite.anchor.set(0.5,0.5)
    containerForeground.addChild(btnMenuSprite)

    let btnSpeedSprite = new PIXI.Sprite(textureSpeedNormal)
    btnSpeedSprite.anchor.set(0.5,0.5)
    containerForeground.addChild(btnSpeedSprite)

    let btnSpeedText= new PIXI.Text({text: "1x", style: textStyleBorder});
    btnSpeedText.scale = 2
    btnSpeedText.anchor.set(0.5,-0.3)
    let btnSpeedContainer = new PIXI.Container()
    btnSpeedContainer.addChild(btnSpeedSprite)
    btnSpeedContainer.addChild(btnSpeedText)
    containerForeground.addChild(btnSpeedContainer)

    let containerGraphsForeground = new PIXI.Container()




    containerGraphsForeground.addChild(graphBorderAreaRight)
    let playerContainer = new PIXI.Container()
    let hodlerContainer = new PIXI.Container()
    let hodlerSprite = new PIXI.Sprite(textureHodler)
    hodlerSprite.scale = 0.05
    hodlerSprite.anchor.set(0.5,0.8)
    hodlerContainer.addChild(hodlerSprite)
    let ownSprite = new PIXI.Sprite(texturePlayer)
    ownSprite.scale = 0.05
    ownSprite.anchor.set(0.5,0.8)
    let playerLabelLine =  new PIXI.Graphics()
    playerLabelLine.visible = false
    let priceLabelContainer = new PIXI.Container()
    let priceLabelLine = new PIXI.Graphics()
    //priceLabelLine.rotateTransform(45*Math.PI/180).rect(-40,-2,38,4).rotateTransform(-90*Math.PI/180).rect(-40,-2,38,4).rotateTransform(45*Math.PI/180)
    for(let i=0;i<100;i++) {
        priceLabelLine.rect(-100-20-i*25,-2,18,4)
        playerLabelLine.rect(-20-i*25,-2,18,4)
    }
    priceLabelLine.fill({color: 0xffffff,alpha:1})
    priceLabelLine.visible = false
    priceLabelContainer.addChild(priceLabelLine)
    playerLabelLine.fill({color: 0xffff00,alpha:1})
    playerContainer.addChild(playerLabelLine)
    playerContainer.addChild(ownSprite)
    let playerLabel = new PIXI.Text({text: "+ 400%", style: textStyleBorder})
    playerContainer.addChild(playerLabel)
    playerLabel.anchor.set(1,1)
    playerLabel.baseX = -40
    playerLabel.baseY = -60

    let priceLabel = new PIXI.Text({text: "100$", style: textStyleBorder});
    let maxPriceLabel =new PIXI.Text({text: "150$", style: textStyleBorder});
    let minPriceLabel =new PIXI.Text({text: "200$", style: textStyleBorder});
    priceLabel.anchor.set(1.1,0.5)
    maxPriceLabel.anchor.set(1.1,0)
    minPriceLabel.anchor.set(1.1,1)
    priceLabelContainer.addChild(priceLabel)
    containerGraphsForeground.addChild(hodlerContainer)
    containerGraphsForeground.addChild(playerContainer)
    containerGraphsForeground.addChild(priceLabelContainer)
    containerGraphsForeground.addChild(maxPriceLabel)
    containerGraphsForeground.addChild(minPriceLabel)
    playerLabel.scale = priceLabel.scale = maxPriceLabel.scale = minPriceLabel.scale = 0.6
 
   

    const particleCount = 21
    const particles = new Array()
    const containerParticles = new PIXI.ParticleContainer({ 
        dynamicProperties: {
            position: true,  // Allow dynamic position changes (default)
            scale: false,    // Static scale for extra performance
            rotation: false, // Static rotation
            color: false     // Static color
        }
    })
    for (let i=0;i<particleCount;i++) {
        let particle = new PIXI.Particle({
            texture: coins['BTC'].texture,
            x: 0,
            y: 0,
            xTarget:0,
            yTarget:0,
            scaleX:0.04,
            scaleY:0.04,
            anchorX: 0.5,
            anchorY: 0.5
        })
        containerParticles.addParticle(particle)
        particles.push(particle)
    }

    app.containerGame.addChild(containerBackground)
    app.containerGame.addChild(containerForeground)
    app.containerGame.addChild(bigTextLayer)
    app.containerGame.addChild(containerParticles)
    app.containerGame.addChild(containerMenu)

    backgroundImage.zIndex = 0
    bigtextContainer.zIndex = 1
    bigTextLayer.attach(bigtextContainer)
    const buyPaused = 1000
   
    const gameData = await fetchGameData(coins)


    let texturesMenu = {}
    texturesMenu.texturePlayer = texturePlayer
    texturesMenu.textureHodler = textureHodler
    texturesMenu.textureHodlerMirror = textureHodlerMirror
    texturesMenu.audioOnTexture = audioOnTexture 
    texturesMenu.audioOffTexture = audioOffTexture 
    texturesMenu.musicOnTexture = musicOnTexture 
    texturesMenu.musicOffTexture = musicOffTexture
    texturesMenu.helpTexture = helpTexture 
    const menu = await createMenu(gameData, app, coins, textStyle, textStyleCentered, texturesMenu)
    containerMenu.addChild(menu)

    function isMenuVisible() {
        return menu.visible
    }

    function showMenu(value) {
        if (!menu.visible && value) {
            menu.visible = true
        } else if (menu.visible && !value) {
            menu.visible = false
        }
    }


    setMute(getMute())
    setMute(getMute('music'),'music')

    

    let options
    var maxVisiblePoints
    let fiatName
    let yourFiat
    let yourCoins
    let yourCoinName
    let paused
    let gameDurationMilliseconds
    let factorMilliSeconds
    let factorSpeed
    let currentIndexFloat
    let currentIndexInteger
    let focusedCoinName
    let isMultiCoin 
    let trades = []
    let graphs = []
    let ownPriceData = []
    let isFinalScreen = false
    let isStopScreen = false
    let canStopManually = false
    let currentDate = null
    let stops = []
    let stopIndizes = []
    const startNewGame = (level) => {
        SoundManager.playMusic(level.music)
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
        factorSpeed = options.factorSpeed || (getQueryParam('fast') ? 5.0 : 1.0) * loadSpeed()
        currentIndexFloat = options.indexStart; // Zeitverfolgung
        currentIndexInteger = Math.floor(currentIndexFloat)
        focusedCoinName = null
        isMultiCoin = options.coinNames.length > 2
        canStopManually = options.canStopManually
        currentDate = null
       
        graphs.forEach(g => {
            containerGraphs.removeChild(g.graph); 
        })
      
        trades.forEach(trade => {
            containerGraphs.removeChild(trade.container); 
        })

       
        particles.forEach((p,i) => { 
            p.x =  -100
            p.y = -100
            p.xTarget = -100; 
            p.yTarget = -150;        
        })
    
        graphs = options.coinNames.filter(name => name !== fiatName).map((c,i) => {
            let container = new PIXI.Container()
            let graph = createGraph(c, graphVertexShader, graphFragmentShader, coins, textStyle, ownVertexShader, ownFragmentShader, textureCloud)
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

        if (!isMenuVisible()) {
            bigtextContainer.active = true

        } else {
            bigtextContainer.active = false

        }

    }

 
    
    const doTrade = (from, to, options) => {

        if ((coins[to].csv && !coins[to].data[currentIndexInteger].price) || (coins[from].csv && !coins[from].data[currentIndexInteger].price)) {
            console.log('trade not possible null data', from, to, currentIndexInteger)
            return
        }

        let trade =  {
            index: currentIndexInteger, 
            final: options?.final,
            percentage: null,
            tradeBefore: null,
            fiat: -1,
            fiatPrice: from === fiatName ? (to === fiatName ? yourCoins : coins[to].data[currentIndexInteger].price) : coins[from].data[currentIndexInteger].price,
            fromPrice: from === fiatName ? 1 : coins[from].data[currentIndexInteger].price,
            fromName: yourCoinName,
            fromCoins: yourCoins,

            toPrice: to === fiatName ? 1 : coins[to].data[currentIndexInteger].price, 
            toName: to, 
            
            toCoins: -1,
            timestamp: Date.now(),
            sprite: null,
            container: new PIXI.Container(),
        }

        
        trade.toCoins = (trade.fromCoins * trade.fromPrice) / trade.toPrice

      

     
        trade.labelPrice = new PIXI.Text( {text: formatCurrency(trade.toName !== fiatName ? trade.toPrice : trade.fromPrice, fiatName,null, true), style: textStyle})
        trade.labelPrice.anchor.set(0.5,1.5)
      
        trade.container.addChild(trade.labelPrice)
        if (from === to && trades.length > 0) {
            trade.labelPrice.scale.set(8*1.0)
        } else {
            trade.sprite = new PIXI.Sprite(coins[to].texture)
            trade.sprite.anchor.set(0.5,0.5)
            trade.sprite.height = trade.sprite.width = 0
            trade.container.addChildAt(trade.sprite, 0)

        }


        trade.fiat = trade.fromCoins *  trade.fromPrice,
        yourFiat = trade.fiat
        yourCoins = trade.toCoins
        yourCoinName = trade.toName
       
        let tradesDifferent = trades.filter((t,i) => ((i === 0 || t.fromName !== t.toName) && (t.toName === trade.fromName || (trade.final && i === trades.length-1))))
        if (tradesDifferent.length > 0 && trade.fromName === fiatName && (trade.toName !== trade.fromName || trade.final)) {
            trade.tradeBefore = tradesDifferent[tradesDifferent.length-1]
            trade.labelPercentage = new PIXI.Text({text: "", style: textStyleBorder})
            trade.labelPercentage.anchor.set(0.5,1.2)  
            trade.container.addChild(trade.labelPercentage)

            let res = (100*(trade.tradeBefore.fiatPrice / trade.fiatPrice))-100
            let resAbs = Math.abs(res)
            let sfxIndex = 1
            if (resAbs > 75) {
                sfxIndex = 5
            } else if (resAbs > 50) {
                sfxIndex = 4
            } else if (resAbs > 25) {
                sfxIndex = 3
            } else if (resAbs > 9) {
                sfxIndex = 2
            }

            if (res < 0) {
                trade.labelPercentage.text  = `- ${-res.toFixed(0)}%`
                !options?.silent && SoundManager.playSFX('trade_lost' + sfxIndex)

            } else {
                trade.labelPercentage.text  = `+ ${res.toFixed(0)}%`
                !options?.silent && SoundManager.playSFX('trade_won' + sfxIndex)

                particles.forEach((p,i) => { 
                    p.x =  playerContainer.x
                    p.y = playerContainer.y
                    p.xTarget = Math.random()*app.screen.width;                 // X-Wert der Kurve
                    p.yTarget = -150;        
                })
            }


        } else {
            !options?.silent && (trade.toName !== trade.fromName || trades.length === 0) && SoundManager.playSFX(trade.toName)
        }
        trades.push(trade)
        containerGraphs.addChild(trade.container)
        paused = buyPaused
        bigtextContainer.active = false
    }


    app.stage.addEventListener('pointermove', (event) => {
        if (isMenuVisible()) {
            menuPointerMoveEvent(menu, event)
        } else {
            btnMenuSprite.active = btnMenuSprite.visible && btnMenuSprite.getBounds().containsPoint(event.x,event.y)
            btnSpeedContainer.active = btnSpeedContainer.visible && btnSpeedContainer.getBounds().containsPoint(event.x,event.y)
            stopImage.active = stopImage.visible && (stopImage.getBounds().containsPoint(event.x,event.y) || stopLabel.getBounds().containsPoint(event.x,event.y))
            swapImage.active = swapImage.visible && (swapImage.getBounds().containsPoint(event.x,event.y) || swapLabel.getBounds().containsPoint(event.x,event.y))
        }
        
});


    window.addEventListener('keyup', (event) => {
        triggerCustomKey(event.key)
    })

    // Event-Listener für keyup hinzufügen
    window.addEventListener('customkey', (event) => {
        let key = event.detail.key
        if (isMenuVisible()) {
            menuKeyUpEvent(menu, event, startNewGame,getMute, setMute, showMenu)
        } else {
            let trade = trades.find(t => t.index === currentIndexInteger)
            let stopIndex = stopIndizes.indexOf(currentIndexInteger)
    
            switch (key) {
                case 'Gamepads3':
                case 'Control':
                    bigtextContainer.active = !bigtextContainer.active
                    break;
                case '+':
                case 'Gamepads5':
                case 'Gamepads7':
                    factorSpeed = saveSpeed(changeSpeed(factorSpeed))
                    btnSpeedContainer.active = false
                    break;
                case '-':
                case 'Gamepads4':
                case 'Gamepads6':
                    factorSpeed = saveSpeed(changeSpeed(factorSpeed, true))
                    btnSpeedContainer.active = false
                    break;
                case 'Gamepads9':
                case 'Gamepads1':
                case 'Escape':
                    startNewGame(gameData.levels.find(level => level.name === 'menu'))
                    showMenu(true)
                    break;
                case ' ':
                case 'w':
                case 'Gamepads0':
                    if (isFinalScreen && timestampAge(trades[trades.length-1].timestamp) > durationMinFinalScreen) {                
                        if (yourFiat === options.fiatBTCHodler) {
                            startNewGame(getNextLevel(options))
                        } else {
                            startNewGame(options)
                        }
                        break;
                    }
                case 'ArrowUp':
                case 'd':
                case 'ArrowRight':
                    if (!trade) {
                        doTrade(yourCoinName, yourCoinName === 'USD' ? 'BTC' : 'USD')
                    }
                    break;
                case 'Enter':
                case 'p':
                case 'P': 
                case 'a':
                case 'ArrowLeft':
                case 's':
                case 'Gamepads2':
                case 'ArrowDown':
                    if (isFinalScreen) {   
                        
                        if (timestampAge(trades[trades.length-1].timestamp) > durationMinFinalScreen) {
                            startNewGame(gameData.levels.find(level => level.name === 'menu'))
                            showMenu(true)
                        }
                       
                    } else {
                        if (stopIndex < 0) {
                            stopIndizes.push(currentIndexInteger)
                            stopIndizes.sort()
                            stops.push(coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date)
                            stops.sort()
                        } else {
                            doTrade(yourCoinName, yourCoinName)
                        }
                    }
                    break;
            }
        }

        
    });


     app.stage.addEventListener('pointerup', (event) => {

        stopImage.active = stopImage.visible && (stopImage.getBounds().containsPoint(event.x,event.y) || stopLabel.getBounds().containsPoint(event.x,event.y))
        swapImage.active = swapImage.visible && (swapImage.getBounds().containsPoint(event.x,event.y) || swapLabel.getBounds().containsPoint(event.x,event.y))
        btnSpeedContainer.active = btnSpeedContainer.visible && btnSpeedContainer.getBounds().containsPoint(event.x,event.y)
        btnMenuSprite.active = btnMenuSprite.visible && btnMenuSprite.getBounds().containsPoint(event.x,event.y)
 
        if (isMenuVisible()) {
            menuPointerUpEvent(menu, event, startNewGame,getMute, setMute, showMenu)
        } else {
            
       
            if (event.y > app.screen.height*gscalet && event.y < app.screen.height*gscalebg) {
                bigtextContainer.active = !bigtextContainer.active
            } 
            
            if (btnSpeedContainer.getBounds().containsPoint(event.x,event.y)){
                factorSpeed = saveSpeed(changeSpeed(factorSpeed))
                btnSpeedContainer.active = false
            } else if (btnMenuSprite.getBounds().containsPoint(event.x,event.y)){
                startNewGame(gameData.levels.find(level => level.name === 'menu'))
                showMenu(true)
                btnMenuSprite.active = false
            } else if (isFinalScreen) {

                if (timestampAge(trades[trades.length-1].timestamp) > durationMinFinalScreen) {
                    if (stopImage.active) {
                        startNewGame(gameData.levels.find(level => level.name === 'menu'))
                        showMenu(true)
                    } else if (swapImage.active) {
                        if (yourFiat === options.fiatBTCHodler) {
                            startNewGame(getNextLevel(options))
                        } else {
                            startNewGame(options)
                        }
                    }
                }
                
            }  else {

                
                let trade = trades.find(t => t.index === currentIndexInteger)
                let stopIndex = stopIndizes.indexOf(currentIndexInteger)
                if ((swapImage.active || stopImage.active) && !isFinalScreen && !trade && canStopManually) {
                    
                    if (stopIndex < 0) {
                        
                        stopIndizes.push(currentIndexInteger)
                        stopIndizes.sort()
                        stops.push(coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date)
                        stops.sort()
                    }
                  
                    
                    if (swapImage.active) {
                        doTrade(yourCoinName, yourCoinName === 'USD' ? 'BTC' : 'USD')
                    } else if (stopImage.active && stopIndex > -1)   {
                        doTrade(yourCoinName, yourCoinName)
                    }

                }
            }


           
        }

       
       
        stopImage.active = swapImage.active = false

       
    })

    
    app.setLoading(1.0, 'Initializing game')
    containerBackground.addChild(graphBorder)
    containerBackground.addChildAt(containerGraphs,3)
    containerBackground.addChild(containerGraphsForeground)

    
    containerForeground.visible = containerBackground.visible = containerMenu.visible = true
    
    menu.visible = false
    
    if (getQueryParam('demo')) {
        showMenu(true)
        startNewGame(gameData.levels.find(level => level.name === 'menu'))
        menu.state = MENU_STATE_HELP
        menu.demo = true
    } else if (getQueryParam('level')) {
        let levelname = getQueryParam('level')
        let level = gameData.levels.find(level => level.name === levelname)
        if (!level) {
            level= gameData.levels.find(level => level.name === '2015')
        }
        startNewGame(level)
        showMenu(false)
    } else {
        startNewGame(gameData.levels.find(level => level.name === 'menu'))
        showMenu(true)
    }
    


   
    app.finishLoading()
    app.ticker.add((deltaTime) => {


        backgroundImage.filters[0].resources.timeUniforms.uniforms.uTime += 0.04 * deltaTime.deltaTime;

        handleGamepadInput()
        
        particles.forEach((p,i) => {
            p.x = 0.9*p.x + 0.1*p.xTarget
            p.y = 0.9*p.y + 0.1*p.yTarget
        })

        let visibleWidth = isFinalScreen ? app.screen.width-10 : app.screen.width-100

        if (isMenuVisible()) {
            updateMenu(menu, app, deltaTime, getMute, getWin, particles)

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
            currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds*factorSpeed;
        } else {
            paused -= deltaTime.elapsedMS
            if (paused < buyPaused) {
                currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds*factorSpeed*(Math.max(0,(buyPaused-paused*2)/buyPaused));
            }
        }

      
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

        maxVisiblePoints = isFinalScreen ? options.indexEnd-options.indexStart : Math.floor(30*(app.screen.width/320))
        currentDate = coins[Object.keys(coins).find(coinName => coinName !== fiatName)].data[currentIndexInteger].date;
        const stepX = (visibleWidth) / (maxVisiblePoints-3);
        isFinalScreen = currentDate >= options.dateEnd
        isStopScreen = isFinalScreen || (stopIndizes.indexOf(currentIndexInteger) >= 0 && !trade)
        let diffCurrentIndexIntToFloat=currentIndexFloat-currentIndexInteger
        let color = hexToRGB(coins[yourCoinName].color, 1.0)
        if (isMenuVisible()) {
            color = hexToRGB(coins['BTC'].color, 1.0)
        }

        if (isMenuVisible()) {
            isStopScreen = false
            isFinalScreen = false
        }
        
        //bigtextContainer.active = isFinalScreen || (stopIndex > -1 && paused > buyPaused)

        if (stopIndex > -1) {
            
            if (!trade && isFinalScreen) {
                
                doTrade(yourCoinName, yourCoinName, {silent: true, final: true})
                bigtextContainer.active = true
                SoundManager.stopMusic()
                if (yourFiat >= options.fiatBTCHodler) {
                    SoundManager.playSFX('game_won')
                } else {
                    SoundManager.playSFX('game_lost')
                }

             
                let tradeCount = trades.filter((trade,i) => ((i > 0 && i < trades.length && trade.fromName !== trade.toName))).length
                let percentageCount = (yourCoinName === fiatName ? yourCoins : yourCoins*coins['BTC'].data[currentIndexInteger]?.price) / coins['BTC'].data[currentIndexInteger]?.price
                let menuWasCompleted = menu.isCompleted
                setWin(options.name, percentageCount, tradeCount)
                updateMenu(menu, app, deltaTime, getMute, getWin, particles)
                if (!menuWasCompleted && menu.isCompleted) {
                    menu.state = MENU_STATE_INTRO
                    showMenu(true)
                }
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

        //visibleWidth = app.screen.width

        if (graphBorder.cheight !== app.screen.height*gscale || graphBorder.cwidth !== visibleWidth) {
            graphBorder.cheight = app.screen.height*gscale
            graphBorder.cwidth = visibleWidth
            graphBorder.clear()
            graphBorder.rect(0,app.screen.height*gscalebg,app.screen.width,app.screen.height*(1.0-gscalebg)).fill({color: 0x4d4d4d}).rect(0, app.screen.height*gscalet, graphBorder.cwidth, graphBorder.cheight)//.stroke({color: 0xffffff, width:2})
        
            graphBorderAreaRight.position.set(visibleWidth,app.screen.height*gscalet)
            graphBorderAreaRight.cheight = graphBorder.cheight
            graphBorderAreaRight.cwidth = 100
            graphBorderAreaRight.clear()
            //graphBorderAreaRight.rect(-10,graphBorder.cheight-4,10,4).rect(-10,0,10,4).rect(-4,0,4,graphBorderAreaRight.cheight).fill({color: 0xffffff,alpha:1}).rect(0,0,graphBorderAreaRight.cwidth,graphBorderAreaRight.cheight).fill({color: 0x4d4d4d, alpha: 0.0})
            graphBorderAreaRight.rect(graphBorderAreaRight.cwidth-10,graphBorder.cheight-4,10,4).rect(graphBorderAreaRight.cwidth -10,0,10,4).rect(graphBorderAreaRight.cwidth -4,0,4,graphBorderAreaRight.cheight).fill({color: 0xffffff,alpha:1})
            
            minPriceLabel.position.set(app.screen.width+1, graphBorderAreaRight.position.y+graphBorderAreaRight.cheight)
            maxPriceLabel.position.set(app.screen.width+1, graphBorderAreaRight.position.y)
            priceLabelContainer.position.set(app.screen.width, graphBorderAreaRight.position.y+graphBorderAreaRight.cheight*0.5)
            
           
            graphBorderMask.clear()
            graphBorderMask.rect(0, 0, isFinalScreen ? app.screen.width : visibleWidth, app.screen.height).fill({color: 0xff0000})
        
            containerGraphs.cmask = graphBorderMask
        }

        let sunPos = backgroundImage.position
        if (!isMenuVisible()) {
            sunPos.y-=100
        }

  let ownText = ''
   let bigText = ''

        graphs.forEach(g => {
            let graphResult = updateGraph(g.graph, app, currentIndexInteger, maxVisiblePoints, stepX, isFinalScreen, isStopScreen, stopIndizes.indexOf(currentIndexInteger), coins, fiatName, trades, focusedCoinName, diffCurrentIndexIntToFloat, options, yourCoinName, isMenuVisible(), ownPriceData,sunPos , color)
            
            if (options.coinNames.length < 3 || !focusedCoinName || focusedCoinName === g.graph.coinName) {
                priceLabel.text = g.graph.priceLabel.text
                priceLabelContainer.y = g.graph.priceLabel.yOriginal
                priceLabel.y = g.graph.priceLabel.y - g.graph.priceLabel.yOriginal
                minPriceLabel.text = g.graph.minPriceLabel.text
                maxPriceLabel.text = g.graph.maxPriceLabel.text

                //playerContainer.mask = graphBorderMask
                //playerContainer.x = graphBorderAreaRight.x
                let ts = trades.filter((trade,i) => ((i === 0 || trade.fromName !== trade.toName) && (trade.toName === fiatName || trade.fromName === fiatName)))
                //trades.filter((t,i) => t.toName !== t.fromName)
                let tp = ts.length < 1 ? yourFiat : (ts[ts.length-1].fromName !== fiatName ? ts[ts.length-1].fromPrice : ts[ts.length-1].fromCoins)

                let p
                if (yourCoinName !== fiatName) {
                    p = getGraphXYForIndexAndPrice(g.graph, currentIndexFloat)
                } else {
                    p = getGraphXYForIndexAndPrice(g.graph, currentIndexFloat, tp)
                }

                playerContainer.x = 0.9*playerContainer.x + 0.1*p.x
                playerContainer.y =  0.9*playerContainer.y + 0.1*p.y
          
                let res = (100*(tp / graphResult.price))-100
                let percentageTotal = (yourCoinName === fiatName ? yourCoins : yourCoins*coins['BTC'].data[currentIndexInteger]?.price) / coins['BTC'].data[currentIndexInteger]?.price
                let resTotal = (100*percentageTotal)-100
              
               
                if (yourCoinName === fiatName) {
                    ownText +=  `You sold ${formatCurrency(null,options.coinNames[1])} at\n${formatCurrency(tp, fiatName, coins[fiatName].digits)}\n\n`

                    ownText +=   `Buy back and\n`
                    if (res < 0) {
                        ownText += `make - ${-res.toFixed(0)}%`
                    } else {
                        ownText += `make + ${res.toFixed(0)}%`
                    }
                } else {
                    ownText +=  `You have\n${formatCurrency(yourCoins, yourCoinName, coins[yourCoinName].digits)}`
                }

                if (stopIndex > 0 && !isFinalScreen && paused > buyPaused) {

                    if (bigtextContainer.visible && bigtextContainer.active) {  
                        if (yourCoinName === fiatName) {
                            ownText +=   `\n\nYou have\n${formatCurrency(yourCoins, yourCoinName, 2)}\n`
                            ownText += `= ${formatCurrency(yourCoins/coins['BTC'].data[currentIndexInteger]?.price, 'BTC', 2)}`
                        }
                        ownText += `,\nwhich is\n`
                        if (resTotal < 0) {
                            ownText += `${-resTotal.toFixed(0)} % less\n`
                            ownText += `than the HODLer, \n`
                        } else {
                            ownText += `${resTotal.toFixed(0)} % more\n`
                            ownText += `than the HODLer,\n`
                        }
                        ownText +=   `who has ${formatCurrency(1,'BTC', 0)}\n`
                        bigText = ownText
                    }
              
              
                } 

                if (isFinalScreen || stopIndex === 0 || (stopIndex > 0 && bigtextContainer.visible && bigtextContainer.active)) {
                    ownText = ''
                }
                   
                
                
                playerLabel.text = ownText

                playerLabel.scale = 0.8
                hodlerSprite.scale = 0.04*Math.max(8,Math.min(12,stepX))*0.2
                ownSprite.scale =  hodlerSprite.scale.x*Math.max(0.5, Math.min(2.0,1.0+ (percentageTotal-1.0)*0.5))
                hodlerSprite.x = ownSprite.x = - ownSprite.width*0.3

               
                if (yourCoinName !== fiatName && stopIndex < 0 && !isFinalScreen && !isMenuVisible()) {
                    if (shepardSoundDown) {
                        shepardSoundDown.muted = true
                    }

                    if (shepardSoundUp) {
                        shepardSoundUp.muted = true
                    }
                } else if (stopIndex < 0 && !isFinalScreen && !isMenuVisible()) {
                    if (!shepardSoundUp || !shepardSoundDown) {
                        
                        Promise.resolve(SoundManager.playSFX('shepard_up', {volume: 0.15, loop: true, singleInstance : true, muted: true})).then(instance => {
                            shepardSoundUp = instance
                        })
                        Promise.resolve(SoundManager.playSFX('shepard_down', {volume: 0.05, loop: true, singleInstance : true, muted: true})).then(instance => {
                            shepardSoundDown = instance
                        })

                    } else {
                        if (res < 0) {
                            shepardSoundDown.muted = SoundManager.mutedSounds
                            shepardSoundUp.muted = true
                        } else {
                            shepardSoundDown.muted = true
                            shepardSoundUp.muted = SoundManager.mutedSounds
                        }
                    }

                } else {
                    
                    if (shepardSoundDown) {
                        shepardSoundDown.muted = true
                    }

                    if (shepardSoundUp) {
                        shepardSoundUp.muted = true
                    }
                }

                if (playerContainer.y < graphBorderAreaRight.y) {playerContainer.y = graphBorderAreaRight.y}
                if (playerContainer.y > graphBorderAreaRight.y+graphBorderAreaRight.height) {playerContainer.y = graphBorderAreaRight.y+graphBorderAreaRight.height}
                
                if (playerContainer.x + playerLabel.baseX - playerLabel.width < app.screen.width*0.1) {
                    playerLabel.x = app.screen.width*0.1 +playerLabel.width-playerContainer.x
                } else {
                    playerLabel.x = playerLabel.baseX
                }

                if (playerContainer.y +playerLabel.baseY -playerLabel.height < app.screen.height*0.1) {
                    playerLabel.y = app.screen.height*0.1 +playerLabel.height-playerContainer.y
                } else {
                    playerLabel.y = playerLabel.baseY
                }
                let pHodler = getGraphXYForIndexAndPrice(g.graph, currentIndexFloat)
                hodlerContainer.x = pHodler.x
                hodlerContainer.y = pHodler.y
                
                hodlerContainer.visible = isFinalScreen
                playerContainer.visible = true
                playerLabel.visible = !(bigtextContainer.visible && bigtextContainer.active)
               
            }
        })


        
     

        dateLabel.text = `${currentDate.toLocaleDateString()}`
        dateLabel.visible = true
        dateLabel.position.set(app.screen.width*0.01, app.screen.height*0.005)
        dateLabel.scale.set(8*SCALE_TEXT_BASE*(Math.min(1080,Math.max(640,app.screen.width))/640.0))

        if (!isFinalScreen) { 
            if (stopIndex === 0) {
                if (!canStopManually) {
                    bigText += `You will trade ${stopIndizes.length-1} ${stopIndizes.length-1 > 1 ? 'times' : 'time'} between\n${options.dateStart.toLocaleDateString()} and ${options.dateEnd.toLocaleDateString()}\n\n`
                    bigText += `The trading ${stopIndizes.length-1 > 1 ? 'dates are' : 'date is'} fixed.\n\n`
                    bigText += `Read the graph,\n`
                    bigText += `Choose wisely and\n`
                    bigText += `Beat the HODler`
                } else {
                    bigText += `Level ${options.name}\n\n`
                    bigText += `You will trade between\n${options.dateStart.toLocaleDateString()} and\n${options.dateEnd.toLocaleDateString()}\n\n`
                    bigText += `Your goal is to beat\n`
                    bigText += `the HODLer by trading.\n`
                    bigText += `The HODLer never sells.\n\n`
                    bigText += `You have 1${formatCurrency(null,options.coinNames[1])}\n`
                    bigText += `The HODLER has 1${formatCurrency(null,options.coinNames[1])}\n`
                    bigText += `1${formatCurrency(null,options.coinNames[1])}= ${formatCurrency(coins[options.coinNames[1]].data[currentIndexInteger]?.price, fiatName, coins[options.coinNames[0]].digits)}\n\n`
                    bigText += `What do you want?`
                }
                
            } 
        } else {
            
            let fiatTrades = trades.filter(trade => trade.toName === fiatName)
            let fiat = yourFiat 
            let res = (100*(fiat / options.fiatBTCHodler - 1))
            bigText += `Level ${options.name}\n`
            
            
            if (fiatTrades.length === 0) {
                bigText += "You won, nice!\n\n" 
            } else if (fiat >= options.fiatBTCHodler) {
                bigText += "Good, but not perfect!\n\n" 
            } else {
                bigText += "Oh no, you lost\n\n" 
            }



            const word = hodlerActivities[Math.floor((deltaTime.lastTime * 0.0005) % hodlerActivities.length)];
           
            bigText += `HODLer  ${formatCurrency(options.fiatBTCHodler/ coins['BTC'].data[currentIndexInteger]?.price, 'BTC', coins['BTC'].digits)}\n`
            bigText += `You     ${formatCurrency(yourFiat / coins['BTC'].data[currentIndexInteger]?.price, 'BTC', coins['BTC'].digits)}\n\n`
               


            if (fiatTrades.length === 0) { 
                bigText += `You did not trade\n`;
                bigText += `You are the HODLer\n\n`;
                bigText += "Congratulations!" 
            } else if (fiat >= options.fiatBTCHodler) {
                bigText += `You have ${res.toFixed(0)} % more\n`
                bigText += `than the HODLer, but\n\n`
                bigText += `The HODLer\n${word},\n`;
                bigText += "while you traded.\n\n" 
                bigText += "Try again?\n" 
            } else {
                bigText += `You have ${-res.toFixed(0)} % less\n`
                bigText += `than the HODLer, and \n\n`
                bigText += `The HODLer\n${word},\n`;
                bigText += "while you traded.\n\n" 
                bigText += "Try again?\n" 
            }
            
            //bigText += "Was it worth\nthe risk and time?"
          
        }
        

        bigtextContainer.visible = (!isMenuVisible() && (stopIndex > -1) )
        bigtextContainer.alpha = bigtextContainer.active
        maxPriceLabel.visible = minPriceLabel.visible = priceLabelContainer.visible = !isFinalScreen
        
       if (bigtextContainer.visible && bigtextContainer.active) {
        if (!bigtextContainer.attached) {
            bigTextLayer.attach(backgroundImage)
            bigtextContainer.attached = true
        }
       } else {
        if (bigtextContainer.attached) {
            bigTextLayer.detach(backgroundImage)
            bigtextContainer.attached = false
        }
   
       }
       
        bigtextLabel.scale = swapLabel.scale = stopLabel.scale = 8*0.75*SCALE_TEXT_BASE

       
        background.shader.resources.backgroundUniforms.uniforms.uR = color[0];
        background.shader.resources.backgroundUniforms.uniforms.uG = color[1];
        background.shader.resources.backgroundUniforms.uniforms.uB = color[2];
        background.shader.resources.backgroundUniforms.uniforms.uA = color[3];
        
        background.shader.resources.backgroundUniforms.uniforms.uTime = deltaTime.lastTime
        background.shader.resources.backgroundUniforms.uniforms.uPercentage = (currentIndexFloat-options.indexStart) / (options.indexEnd - options.indexStart)
        background.shader.resources.backgroundUniforms.uniforms.uSun =[(sunPos.x)/app.screen.width,1.0-(sunPos.y)/app.screen.height]
    
        background.shader.resources.backgroundUniforms.uniforms.uResolution = [app.screen.width,app.screen.height]
        //background.shader.resources.backgroundUniforms.uniforms.uMenuTop = isMenuVisible() ? 0: [app.screen.width,dateLabel.height*1.4+dateLabel.position.y]

        stopContainer.y = gscalebg*app.renderer.height
        stopImage.height = stopImage.width = (stopImage.active ? 1.1 : 1.0) * 0.5 * gscaleb*app.renderer.height
        swapImage.height = swapImage.width = (swapImage.active ? 1.1 : 1.0) * 0.5 * gscaleb*app.renderer.height
 

      
        if (isFinalScreen) {
            stopImage.texture = textureBtnMenu
           
            if (yourFiat === options.fiatBTCHodler) {
                swapLabel.text = options.next ? options.next.name : 'NEXT'
                swapImage.texture = textureBtnPlay
            } else {
                swapLabel.text = 'TRY AGAIN'
                swapImage.texture = textureBtnTrade
            }
            stopLabel.text = 'MENU'
            
           
            stopLabel.alpha = stopImage.alpha = swapLabel.alpha = swapImage.alpha = timestampAge(trades[trades.length-1].timestamp) / durationMinFinalScreen - 1.0

        } else{
            swapLabel.text = (stopIndex === 0 ? (yourCoinName === 'USD' ? 'BTC' : 'USD') : (yourCoinName === 'USD' ? 'Buy' : 'Sell')) 
            stopLabel.text = (stopIndex === 0 ? yourCoinName : (stopIndex > 0 ? 'Resume' : 'Pause'))    
            stopImage.texture = (stopIndex === 0 ? coins[yourCoinName].texture : (stopIndex > 0 ? textureBtnPlay : textureBtnStop)) 
            swapImage.texture = coins[yourCoinName === 'USD' ? 'BTC' : 'USD'].texture
        }

        stopImage.position.set(app.renderer.width*0.25, 0.6 * gscaleb*app.renderer.height)
        stopLabel.position.set(app.renderer.width*0.25, 0.6 * gscaleb*app.renderer.height-stopImage.height*0.75)
        
        swapImage.position.set(app.renderer.width*0.75, 0.6 * gscaleb*app.renderer.height)
        swapLabel.position.set(app.renderer.width*0.75, 0.6 * gscaleb*app.renderer.height-swapImage.height*0.75)
        
       

        stopContainer.visible =  isFinalScreen || !trade

        btnMenuSprite.scale = (btnMenuSprite.active ? 1.1 : 1.0) *0.3*(Math.min(1080,Math.max(640,app.screen.width))/640.0)*0.5
        btnMenuSprite.position.set(app.screen.width - btnMenuSprite.width*0.6, btnMenuSprite.height*0.7)
        btnSpeedContainer.scale = (btnSpeedContainer.active ? 1.1 : 1.0) *0.3*(Math.min(1080,Math.max(640,app.screen.width))/640.0)*0.5
        btnSpeedContainer.position.set(app.screen.width - btnSpeedContainer.width*(0.6+1.3)/(btnSpeedContainer.active ? 1.1 : 1.0), btnSpeedContainer.height*0.7)
        btnSpeedText.text = formatSpeedAsFraction(factorSpeed)
        if (factorSpeed > 1.0) {
            btnSpeedSprite.texture = textureSpeedFast
        } else if (factorSpeed < 1.0) {
            btnSpeedSprite.texture = textureSpeedNormal
        } else {
            btnSpeedSprite.texture = textureSpeedNormal
        }
        
        if (isMenuVisible()) {
            backgroundImage.texture = coins['BTC'].texture 
        } else {
            backgroundImage.texture = bigtextContainer.active ? textureWhiteCoin : coins[yourCoinName].texture
        }

     
       
        if (isMenuVisible()) {
            backgroundImage.x = visibleWidth -backgroundImage.width*0.5+ Math.sin(deltaTime.lastTime*0.0001)*0.1*(visibleWidth);
            backgroundImage.y = app.renderer.height*0.1 + Math.sin(2*deltaTime.lastTime*0.0001)*app.renderer.height / 16 + (1.0-gscalebg)*app.screen.height*2
            backgroundImage.scale = 0.8*(Math.min(app.screen.width,1080)/1080)
        
            graphBorder.visible = false
            containerGraphsForeground.visible = false
            containerGraphs.mask = null

        } else {
            backgroundImage.x = 0.1*backgroundImage.x + 0.9*(visibleWidth -backgroundImage.width*0.5+ (-1.0+Math.sin(deltaTime.lastTime*0.0001))*0.1*(visibleWidth));
            backgroundImage.y = 0.1*backgroundImage.y + 0.9*(app.renderer.height*0.1 + Math.sin(2*deltaTime.lastTime*0.0001)*app.renderer.height / 16 + (1.0-gscalebg)*app.screen.height)
            backgroundImage.scaleWanted = 0.8*(Math.min(app.screen.width,1080)/1080)

            if (bigtextContainer.visible && bigtextContainer.active) {
                //backgroundImage.y = app.screen.height*0.3
                bigtextLabel.text = bigText
                let w = bigtextLabel.width*1.1
                let h = bigtextLabel.height*1.1
                //bigtextContainer.position.set(app.screen.width*0.5, app.screen.height*(gscalet + gscale*0.5))
                bigTextBackground.scale.set(w,h)
                if (backgroundImage.width < w) {
                    backgroundImage.scale = 0.9
                }
                if (backgroundImage.x + backgroundImage.width*0.5 > visibleWidth) {
                    backgroundImage.x = visibleWidth-backgroundImage.width*0.5
                }

                if (backgroundImage.x - backgroundImage.width*0.5 < 0) {
                    backgroundImage.x = app.screen.width*0.5
                }

               // bigtextContainer.position.set(Math.floor(backgroundImage.position.x) ,Math.floor(backgroundImage.position.y))
               bigtextContainer.position.set(backgroundImage.position.x ,backgroundImage.position.y)
               containerGraphsForeground.visible = true
            } else {
                backgroundImage.scale = backgroundImage.scale.x*0.9 + backgroundImage.scaleWanted*0.1
                containerGraphsForeground.visible = true
            }

            graphBorder.visible = true
            graphBorderAreaRight.visible = false
            containerGraphs.mask = containerGraphs.cmask

        }
        

        if (isMenuVisible()){
           containerGraphs.position.set(100-diffCurrentIndexIntToFloat*stepX,(1.0-gscalebg)*app.screen.height)
        } else {
           containerGraphs.position.set(-stepX*containerGraphs.scale.x-diffCurrentIndexIntToFloat*stepX,0.0)
        }       


        


        if (isFinalScreen) {

            const A = backgroundImage.width*0.25; // Horizontale Ausdehnung
            const B = Math.min(A*0.7,0.4*(app.screen.height*(1.0-gscalebg))); // Vertikale Ausdehnung
            const centerX = backgroundImage.x
            const centerY = backgroundImage.y + backgroundImage.height*0.6

            const circleRadius = backgroundImage.height*0.5; // Setze den gewünschten Radius
            const circleCenterX = backgroundImage.x; // X-Koordinate des Kreiszentrums
            const circleCenterY = backgroundImage.y; // Y-Koordinate des Kreiszentrums
            let durationLemniscate = 0
            let durationCircle = 0
            if (yourFiat > options.fiatBTCHodler) {
                durationLemniscate = 0
                durationCircle = 32
            } else if (yourFiat === options.fiatBTCHodler) {
                durationLemniscate = 9
                durationCircle = 12 
            } 

            if (durationLemniscate + durationCircle > 0) {
                particles.forEach((p, i) => {
                    const followOffset = i * 300; // Abstand zwischen den Partikeln
                    const t = (deltaTime.lastTime + followOffset) * 0.001; // Zeitversatz für den Wurm-Effekt
    
                    if (t % (durationLemniscate+durationCircle) > durationCircle) {
                        p.phase = "lemniscate";
                    } else {
                        p.phase = "circle"
                    }
                    if (p.phase === "circle") {
                        // Bewegung entlang des Kreises
                        p.xTarget = circleCenterX + circleRadius * Math.cos(t);
                        p.yTarget = circleCenterY + circleRadius * Math.sin(t);
                        
                        // Nach einer bestimmten Zeit auf die Lemniskate umschalten
                     
                    } else if (p.phase === "lemniscate") {
                        // Bewegung entlang der Lemniskate
                        p.xTarget = centerX + A * Math.sin(t);
                        p.yTarget = centerY + B * Math.sin(2 * t) / 2;
                    }
                });
            }
            
        } 
    });
}

window.addEventListener("load", (event) => {
    initGame();
})
