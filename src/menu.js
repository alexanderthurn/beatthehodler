const MENU_STATE_INTRO = 1
const MENU_STATE_LEVELS = 2
const MENU_STATE_HELP = 3




async function createMenu(gameData, app, coins, textStyle, textStyleCentered, textureHodler, texturePlayer, particles) {


    let menu = new PIXI.Container()
    menu.state = MENU_STATE_INTRO
    menu.gameData = gameData
    menu.coins = coins
    menu.textStyleTitle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 64,
        fill: '#fff',
        wordWrap: false,
        wordWrapWidth: 440,
    });

    menu.textStylePreview = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 32,
        fill: '#fff',
    });

    menu.textStylePreviewSub = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 32,
        fill: '#fff',
    });


    menu.textStyleClick = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 32,
        fill: '#fff',
        stroke: {color: '#4d4d4d', width: 2},
        wordWrap: true,
        wordWrapWidth: app.screen.width,
    });

    menu.background = new PIXI.Graphics();
    menu.addChild(menu.background)
    menu.background
    .rect(0, 0, 1024, 1024)
    .fill({ color: 0xf4b400 });

    menu.spriteHodler = new PIXI.Sprite(textureHodler)
    menu.spritePlayer = new PIXI.Sprite(texturePlayer)
    menu.spriteHodler.anchor.set(0.5,1)
    menu.spritePlayer.anchor.set(0.5,1)
    menu.addChild(menu.spriteHodler)
    menu.addChild(menu.spritePlayer)
    
    menu.title = new PIXI.Text({text: 'Beat the Hodler', style: menu.textStyleTitle})
    menu.title.anchor.set(0.5,0.0)
    menu.addChild(menu.title)

    menu.subtitle = new PIXI.Text({text: 'Can you win by trading?', style: menu.textStyleTitle })
    menu.subtitle.anchor.set(0.5,-2.0)
    menu.addChild(menu.subtitle)

    menu.finaltitle = new PIXI.Text({text: 'by Alexander Thurn', style: menu.textStyleTitle })
    menu.finaltitle.anchor.set(0.5,1.0)
    menu.addChild(menu.finaltitle)

    menu.clickTitle = new PIXI.Text({text: 'A "Hodler" holds, no matter what!', style: menu.textStyleClick }) 
    menu.clickTitle.textMobile = 'A "Hodler" holds,\n no matter what!'
    menu.clickTitle.textDesktop = 'A "Hodler" holds, no matter what!'

    menu.clickTitle.anchor.set(0.5,1.5)
    menu.addChild(menu.clickTitle)

    menu.levelGroupsContainer = new PIXI.Container()
    menu.addChild(menu.levelGroupsContainer)

    menu.levelGroups = gameData.groups.map(group => {
        let e = new PIXI.Container()
        e.title = new PIXI.Text({text: 'group.name', style: textStyle })
        e.title.anchor.set(0,0.0)
        e.addChild(e.title)
        e.label = group.name
        e.levelEntries = []
        e.title.visible = false
        e.levels = new PIXI.Container()
        e.addChild(e.levels)
        return e
    })

    menu.levelEntries = gameData.levels.filter(g => g.group === '21').map((level,index) => {
        let e = new PIXI.Container()
        e.level = level
        e.group = e.level.group
     
        e.index = new PIXI.Container()
        e.indexText = new PIXI.Text( {text: e.level.name, style: menu.textStylePreview})
        e.indexSubText = new PIXI.Text({text: '0%', style: menu.textStylePreviewSub})
        e.indexSubText.value = 0.0
        e.indexBackgroundRadius = 512
       // e.indexBackground = new PIXI.Graphics().circle(0,0,e.indexBackgroundRadius).fill(0xF7931B, 1).stroke({color: 0xffffff, width:e.indexBackgroundRadius*0.1})
        e.indexBackground = new PIXI.Graphics().rect(-e.indexBackgroundRadius, -e.indexBackgroundRadius/2,e.indexBackgroundRadius*2, e.indexBackgroundRadius).fill({color: 0xF7931B, alpha: 1}).stroke({color: 0xffffff, width:e.indexBackgroundRadius*0.025})
        
        e.index.addChild(e.indexBackground)
        e.index.addChild(e.indexText)
        e.index.addChild(e.indexSubText)
        e.indexText.anchor.set(0.5,0.5)
        e.indexSubText.anchor.set(0.5,0.5)
        e.addChild(e.index)


        let group = menu.levelGroups.find(group => group.label === e.level.group)
        group.levels.addChild(e)
        group.levelEntries.push(e)
        return e
    })

    menu.levelGroupsContainer.addChild(...menu.levelGroups)

    menu.audioOnTexture = await PIXI.Assets.load({src: 'gfx/audio_on.png'})
    menu.audioOffTexture = await PIXI.Assets.load({src: 'gfx/audio_off.png'})
    menu.musicOnTexture = await PIXI.Assets.load({src: 'gfx/music_on.png'})
    menu.musicOffTexture = await PIXI.Assets.load({src: 'gfx/music_off.png'})
    menu.helpTexture = await PIXI.Assets.load({src: 'gfx/help.png'})

    menu.audioButtonSprite = new PIXI.Sprite(menu.audioOnTexture);
    menu.addChild(menu.audioButtonSprite)

    
    menu.musicButtonSprite = new PIXI.Sprite(menu.musicOnTexture);
    menu.addChild(menu.musicButtonSprite)

    menu.helpButtonSprite = new PIXI.Sprite(menu.helpTexture);
    menu.addChild(menu.helpButtonSprite)

    menu.helpButtonSprite.right = menu.musicButtonSprite
    menu.helpButtonSprite.left = menu.audioButtonSprite
    menu.musicButtonSprite.left = menu.helpButtonSprite
    menu.musicButtonSprite.right = menu.audioButtonSprite
    menu.audioButtonSprite.left = menu.musicButtonSprite
    menu.audioButtonSprite.right = menu.helpButtonSprite


    menu.pointer = {x: app.screen.width/2, y:app.screen.height / 6 * 5}
    return menu
}



function menuPointerMoveEvent(menu, event) {
    menu.levelEntries.filter(entry =>  true || entry.isCompletedLevelBefore ).forEach((entry,index2) => {
        entry.active = entry.getBounds().containsPoint(event.x,event.y)
    })
    menu.audioButtonSprite.active = menu.audioButtonSprite.getBounds().containsPoint(event.x,event.y)   
    menu.musicButtonSprite.active = menu.musicButtonSprite.getBounds().containsPoint(event.x,event.y)   
    menu.helpButtonSprite.active = menu.helpButtonSprite.getBounds().containsPoint(event.x,event.y)
    menu.spritePlayer.active = menu.spritePlayer.getBounds().containsPoint(event.x,event.y)
    menu.spriteHodler.active = menu.spriteHodler.getBounds().containsPoint(event.x,event.y)

    menu.pointer.x = event.x
    menu.pointer.y = event.y
}

function menuKeyUpEvent(menu, event, startNewGame, getMute, setMute, showMenu) {
    let key = event.detail.key

    if (menu.state === MENU_STATE_INTRO) {
        switch (key) {
            case 'Gamepads0':
            case 'Enter':    
            case ' ': 
            menu.state = MENU_STATE_LEVELS
            break;
        }
    } else {
        let entry = menu.levelEntries.find(entry => entry.active)
        if (!entry && menu.helpButtonSprite.active) {
            entry = menu.helpButtonSprite
        }
        if (!entry && menu.musicButtonSprite.active) {
            entry = menu.musicButtonSprite
        }
        if (!entry && menu.audioButtonSprite.active) {
            entry = menu.audioButtonSprite
        }
        switch (key) {
            case 'w':
            case 'GamepadsUp':
            case 'Gamepads12':
            case 'ArrowUp':
                if (!entry) {
                    menu.levelEntries[0].active = true
                } else {
                    entry.active = false
                    entry.up.active = true
                }
            break;
            case 'd':   
            case 'Gamepads15':
            case 'GamepadsRight':
            case 'ArrowRight':
                if (!entry) {
                    menu.levelEntries[0].active = true
                } else {
                    entry.active = false
                    entry.right.active = true
                }    
            break;
            case 'a':
            case 'Gamepads14':
            case 'GamepadsLeft':
            case 'ArrowLeft':
                if (!entry) {
                    menu.levelEntries[0].active = true
                } else {
                    entry.active = false
                    entry.left.active = true
                }
                break;
            case 's':
            case 'Gamepads13':
            case 'GamepadsDown':
            case 'ArrowDown':
                if (!entry) {
                    menu.levelEntries[0].active = true
                } else {
                    entry.active = false
                    entry.down.active = true
                }
                break;
            case 'Gamepads1':
            case 'Gamepads9':
            case 'Tab':
            case 'Escape':
                if (menu.state === MENU_STATE_LEVELS) {
                    menu.state = MENU_STATE_INTRO
                }
                break;
            case 'Gamepads0':
            case 'Enter':    
            case ' ':
                if (entry) {
                    if (entry === menu.audioButtonSprite) {
                        setMute(!getMute())
                        SoundManager.playSFX('trade_won1')
                    } else if (entry === menu.musicButtonSprite) {
                        setMute(!getMute('music') ,'music')
                    } else if (entry === menu.helpButtonSprite) {
                        //setMute(!getMute())
                        SoundManager.playSFX('trade_won1')
                    } else {
                        showMenu(false)
                        startNewGame(entry.level) 
                    }

                }
                break;
        }
    }
}

function menuPointerUpEvent(menu, event, startNewGame, getMute, setMute, showMenu) {

    menu.pointer.x = event.x
    menu.pointer.y = event.y

    if (menu.state === MENU_STATE_INTRO) {
        menu.state = MENU_STATE_LEVELS
    } else {
        menu.levelEntries.filter(entry => true || entry.isCompletedLevelBefore ).forEach((entry,index2) => {
            if (entry.getBounds().containsPoint(event.x,event.y)) {
                if (!entry.active ) {
                    entry.active = true
                } else {
                    showMenu(false)
                    startNewGame(entry.level) 
                    entry.active = false
    
                }
            } else {
                entry.active = false
            }
        })
    
        if (menu.audioButtonSprite.getBounds().containsPoint(event.x,event.y)) {
            setMute(!getMute())
            SoundManager.playSFX('trade_won1')
        } 
            
        if (menu.musicButtonSprite.getBounds().containsPoint(event.x,event.y)) {
            setMute(!getMute('music') ,'music')
        } 
    
        if (menu.helpButtonSprite.getBounds().containsPoint(event.x,event.y)) {
            //setMute(!getMute())
            SoundManager.playSFX('trade_won1')
        } 
    }
    

}

function updateMenu(menu, app, deltaTime, getMute, getWin, particles) {
    menu.background.scale.set(app.screen.width / 1024, app.screen.height / 1024)
    menu.background.alpha = 0.0
    menu.audioButtonSprite.scale = (menu.audioButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.audioButtonSprite.position.set(app.screen.width - menu.audioButtonSprite.width * 1.2, app.screen.height -menu.audioButtonSprite.height * 1.2 )
    menu.audioButtonSprite.texture = getMute() ? menu.audioOffTexture : menu.audioOnTexture

    menu.musicButtonSprite.scale = (menu.musicButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.musicButtonSprite.position.set(app.screen.width - menu.musicButtonSprite.width * 2.5, app.screen.height -menu.musicButtonSprite.height * 1.2 )
    menu.musicButtonSprite.texture = getMute('music') ? menu.musicOffTexture : menu.musicOnTexture


    menu.helpButtonSprite.scale = (menu.helpButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.helpButtonSprite.position.set(menu.helpButtonSprite.width * 0.2, app.screen.height -menu.helpButtonSprite.height * 1.2 )
   

    menu.helpButtonSprite.up = menu.musicButtonSprite.up = menu.audioButtonSprite.up = menu.levelEntries[menu.levelEntries.length-1]
    menu.helpButtonSprite.down = menu.musicButtonSprite.down = menu.audioButtonSprite.down = menu.levelEntries[0]


    let scaleToFullHD = app.screen.width/1920

    menu.title.scale.set(4*scaleToFullHD*0.5)
    menu.subtitle.scale.set(scaleToFullHD)
    menu.finaltitle.scale.set(scaleToFullHD)
    menu.finaltitle.position.set(app.screen.width*0.5, app.screen.height)

    menu.spritePlayer.scale = menu.spriteHodler.scale = 0.25*(Math.min(1080,Math.max(640,app.screen.width))/640.0)
    menu.spritePlayer.y = app.screen.height*0.8 + Math.cos(deltaTime.lastTime*0.002)*app.screen.height*0.02
    menu.spriteHodler.y = app.screen.height*0.8 + Math.sin(deltaTime.lastTime*0.001)*app.screen.height*0.01
    if (menu.state === MENU_STATE_INTRO) {
        menu.spriteHodler.x = app.screen.width*0.75
        menu.spritePlayer.x = app.screen.width*0.25
        menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.musicButtonSprite.visible = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = false
        menu.clickTitle.visible = true
        menu.textStyleClick.wordWrapWidth = app.screen.width*0.75*2
        if (app.screen.width < 1280) {
            menu.clickTitle.text = menu.clickTitle.textMobile
        } else {
            menu.clickTitle.text = menu.clickTitle.textDesktop
        }
        menu.clickTitle.scale = 0.5
        menu.clickTitle.position.set(app.screen.width*0.5, app.screen.height)
        menu.clickTitle.alpha =  deltaTime.lastTime % 3000 > 500 ? 1.0 : 0.0
        menu.clickTitle.rotation =Math.sin(deltaTime.lastTime*0.01)*0.01

        menu.title.scale.set(4*Math.min(1,scaleToFullHD)*0.5)
        menu.subtitle.scale.set(4*Math.min(0.5,scaleToFullHD)*0.25)
        menu.title.position.set(app.screen.width*0.5, app.screen.height*0.1)
        menu.subtitle.position.set(app.screen.width*0.5, app.screen.height*0.15)
       // menu.subtitle.rotation = menu.title.rotation = -10*Math.PI/360

    } else if (menu.state === MENU_STATE_LEVELS) {
        menu.spriteHodler.x = 0.9* menu.spriteHodler.x + 0.1*app.screen.width*1.05 
        menu.spritePlayer.x = 0.9*menu.spritePlayer.x + 0.1*-app.screen.width*0.05

        menu.clickTitle.alpha*=0.92
        menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.musicButtonSprite.visible = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = true
        menu.subtitle.alpha*=0.92
       
        menu.title.position.set(0.9*menu.title.position.x+0.1*app.screen.width*0.5, 0.9*menu.title.position.y+0.1*app.screen.height*0.05)
        menu.subtitle.rotation = menu.title.rotation = 0
        menu.subtitle.position.set(0.9*menu.subtitle.position.x+0.1*app.screen.width*0.5, 0.9*menu.subtitle.position.y+0.1*app.screen.height*0.0)
        
        let cw = app.screen.width * 0.9
        let ch = app.screen.height *0.9 - menu.levelGroupsContainer.position.y
        let cols = cw > ch*2 ? 4 : 3 
        let rows = cw > ch*2 ? 3 : 4
        let colw = cw / cols
        let colh = ch / rows
        colh = Math.min(colw, colh)
        ch = colh * rows
        menu.levelGroupsContainer.position.set(0.5*(app.screen.width - cw), 20+menu.subtitle.position.y - menu.subtitle.height*menu.subtitle.anchor.y + menu.subtitle.height + (app.screen.height*0.9 - menu.levelGroupsContainer.position.y -ch)*0.5)
        menu.cols = cols
        menu.rows = rows
        menu.levelGroups.forEach((group,index) => {
            group.levelEntries.forEach((entry,index2) => {
                entry.indexText.scale.set(0.4* (Math.max(640, app.screen.width)/640) * (entry.active ? 1.1 : 1.0))
                entry.indexSubText.scale.set(0.3* (Math.max(640, app.screen.width)/640)* (entry.active ? 1.1 : 1.0)) 
                entry.indexSubText.position.set(0,  entry.indexText.height/2)
                entry.indexText.position.set(0,  -entry.indexText.height/2)
                let score = getWin(entry.level.name)
                entry.isCompleted = score > 0
                entry.isCompletedLevelBefore = index2 === 0 || getWin(group.levelEntries[index2-1].level.name)
                entry.col = (index2 % cols)
                entry.row = Math.floor(index2 / cols)
                entry.position.set(entry.col * colw + colw*0.5,entry.row*colh + colh*0.5)
                entry.right = group.levelEntries[entry.col < menu.cols-1 ? index2+1 : index2-entry.col]
                entry.left =  group.levelEntries[entry.col > 0 ? index2-1 : index2+menu.cols-1]
                entry.up =  group.levelEntries[entry.row > 0 ? index2-cols : group.levelEntries.length-(menu.cols-entry.col)]
                entry.down =  group.levelEntries[(index2+cols) % group.levelEntries.length]
                
                if (entry.row === 0) {
                    entry.up = menu.helpButtonSprite
                }

                if (entry.row === menu.rows-1) {
                    entry.down = menu.helpButtonSprite
                }

                entry.indexBackground.scale = (entry.active && (true || entry.isCompletedLevelBefore) ? 1.0 : 0.9) * Math.min(colw / (entry.indexBackgroundRadius*2), colh / (entry.indexBackgroundRadius))
                entry.index.alpha = entry.active && entry.isCompletedLevelBefore ? 1.0 : 1.0
    
                if (entry.indexSubText.value !== score)  {
                    entry.indexSubText.value = score
                    if (score === true || score === null) {
                        entry.indexSubText.text = ''
                    } else {
                        entry.indexSubText.text =  score > 0 ? '+' + (score).toFixed(0) + '%' : score.toFixed(0) + '%'
                    }
                }

            })
        })

    }
   
    
    
  

    // Berechnung der Lemniskate (Unendlichkeitszeichen)
    const A = (menu.state !== MENU_STATE_INTRO ? 5.0 : 1.0)*Math.min(app.screen.height*0.2, app.screen.width*0.4); // Horizontale Ausdehnung
    const B = (menu.state !== MENU_STATE_INTRO ? 0.1 : 1.0)*A*0.5; // Vertikale Ausdehnung
    const centerX = (menu.state !== MENU_STATE_INTRO ?-100 : app.screen.width/2);
    const centerY = (menu.state !== MENU_STATE_INTRO ? -100 : app.screen.height / 6 * 5) 

    particles.forEach((p,i) => {
     
        const followOffset = i * 180; // Abstand zwischen den Partikeln
        const t = deltaTime.lastTime + followOffset; // Zeitversatz für den Wurm-Effekt

        // Position der Partikel entlang der Lemniskate
        p.xTarget = centerX + A * Math.sin(t*0.001);                 // X-Wert der Kurve
        p.yTarget = centerY + B * Math.sin(2 * t*0.0010) / 2;        
  

    })
}

/*   p.x = Math.random() * app.screen.width
        p.y = Math.random() * app.screen.height
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const faceWidth = app.screen.width * 0.5;
        const faceHeight = app.screen.height * 0.5;
    
        if (i === 0) {
            // Linkes Auge
            p.baseX = centerX - faceWidth * 0.2;
            p.baseY = centerY - faceHeight * 0.25;
        } else if (i === 1) {
            // Rechtes Auge
            p.baseX = centerX + faceWidth * 0.2;
            p.baseY = centerY - faceHeight * 0.25;
        } else {
            // Mund (Parabel)
            const mouthWidth = faceWidth * 0.5; // Mundbreite
            const mouthHeight = faceHeight * 0.1; // Krümmung
            const t = (i - 2) / (menu.particles.length - 3); // Normierung [0, 1]
            const offsetX = mouthWidth * (t - 0.5); // X relativ zum Mund
            const offsetY = -Math.pow(offsetX / mouthWidth * 2, 2) * mouthHeight; // Parabel
    
            p.baseX = centerX + offsetX;
            p.baseY = centerY + offsetY + faceHeight * 0.2; // Unterhalb der Augen
        }
    
        // Zufällige Bewegung initialisieren
        p.offsetX = Math.random() * 2 - 1;
        p.offsetY = Math.random() * 2 - 1;
    
        // Berechne aktuelle Position
        p.x = p.baseX + Math.sin(Date.now() * 0.002 + p.offsetX) * 5; // Bewegung in X
        p.y = p.baseY + Math.cos(Date.now() * 0.002 + p.offsetY) * 5; // Bewegung in Y
    */
