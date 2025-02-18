const MENU_STATE_INTRO = 1
const MENU_STATE_LEVELS = 2
const MENU_STATE_HELP = 3




async function createMenu(gameData, app, coins, textStyle, textStyleCentered, texturesMenu) {


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

    menu.textStyleHelper = menu.textStylePreview.clone()
    menu.textStyleHelper.align = 'center'
    menu.textStyleHelper.wordWrap = true
    //menu.textStyleHelper.stroke = {color: '#000000', width: 3}

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

    menu.spriteHodler = new PIXI.Sprite(texturesMenu.textureHodlerMirror)
    menu.spritePlayer = new PIXI.Sprite(texturesMenu.texturePlayer)
    menu.spriteHodler.anchor.set(0.5,1)
    menu.spritePlayer.anchor.set(0.5,1)
    menu.addChild(menu.spriteHodler)
    menu.addChild(menu.spritePlayer)
    
    menu.title = new PIXI.Text({text: 'Beat the HODLer', style: menu.textStyleTitle})
    menu.title.anchor.set(0.5,0.0)
    menu.addChild(menu.title)

    menu.subtitle = new PIXI.Text({text: 'Can you win by trading?', style: menu.textStyleTitle })
    menu.subtitle.anchor.set(0.5,-2.0)
    menu.addChild(menu.subtitle)

    menu.finaltitle = new PIXI.Text({text: '', style: menu.textStyleTitle })
    menu.finaltitle.anchor.set(0.5,1.2)
    menu.finaltitle.texts = ['by Alexander Thurn', 'github.com/alexanderthurn/coinswiper', 'feuerware.com']
    menu.addChild(menu.finaltitle)

    menu.clickTitle = new PIXI.Text({text: 'A "HODLer" holds, no matter what!', style: menu.textStyleClick }) 
    menu.clickTitle.textMobile = 'A "HODLer" holds,\n no matter what!'
    menu.clickTitle.textDesktop = 'A "HODLer" holds, no matter what!'

    menu.clickTitle.anchor.set(0.5,1.5)
    menu.addChild(menu.clickTitle)

    menu.clickTitle2 = new PIXI.Text({text: 'Press left mouse button, "A" on controller or "ENTER" on keyboard.', style: menu.textStyleClick }) 
    menu.clickTitle2.textMobile = ''
    menu.clickTitle2.textDesktop = 'Press left mouse button, "A" on controller or "ENTER" on keyboard.'
    menu.clickTitle2.anchor.set(0.5,0.5)
    menu.addChild(menu.clickTitle2)


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
        e.indexSubText.value = Number.MAX_VALUE



       e.indexBackground = new PIXI.Graphics()
        .rect(-0.5, -0.5,1, 1)
        .fill({color: 0xffffff, alpha: 0.8})

        e.indexDifficultyContainer = new PIXI.Container()
        e.indexDifficultyBackground = new PIXI.Graphics()
        .rect(-1, 0,1, 1)
        .fill({color: 0xffffff, alpha: 0.7})
        e.indexDifficultyLabel =  new PIXI.Text({text: 'HARD', style: menu.textStylePreviewSub})
        e.indexDifficultyLabel.anchor.set(1.05,-0.05)
        e.indexCompletedContainer = new PIXI.Container()
        e.indexCompletedGraphics = new PIXI.Graphics().star(0,0,7,1).fill({color: 0xffffff, alpha: 1.0})
        e.indexCompletedContainer.addChild(e.indexCompletedGraphics)
        
        e.indexDifficultyContainer.addChild(e.indexDifficultyBackground)
        e.indexDifficultyContainer.addChild(e.indexDifficultyLabel)

        e.index.addChild(e.indexBackground)
        e.index.addChild(e.indexCompletedContainer)
        e.index.addChild(e.indexDifficultyContainer)
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

    menu.audioOnTexture = texturesMenu.audioOnTexture
    menu.audioOffTexture = texturesMenu.audioOffTexture
    menu.musicOnTexture =  texturesMenu.musicOnTexture
    menu.musicOffTexture =  texturesMenu.musicOffTexture
    menu.helpTexture =  texturesMenu.helpTexture

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


    menu.helpContainer = new PIXI.Container()
    const gameInstructions = "Welcome to the ultimate Bitcoin challenge!\nYour goal is simple: outperform the HODLer.\n\nHow it works:\n- The Bitcoin price fluctuates over time. Buy low, sell high!\n- At the end of the game, your performance is compared to a HODLer (who simply holds BTC).\n- Your score is based on how much better (or worse) you did compared to HODLing.\n\nControls:\n- Gamepad, Mouse, or Keyboard - Play however you like!\n\nWinning?\n- The secret lesson: HODLing is king. The best way to win...is to do nothing. Thx coingecko.com for coin data, fontspace for font, frozenfractal.com for its sfx generator and pixabay for sounds.";

    menu.helpText = new PIXI.Text({text: gameInstructions, style: menu.textStyleHelper})
    menu.helpText.anchor.set(0.5,0)
    menu.helpContainer.addChild(menu.helpText)
    menu.helpContainer.pageIndex = 0
    menu.addChild(menu.helpContainer)

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
            menu.levelEntries[0].active = true
            menu.state = MENU_STATE_LEVELS
            break;
        }
    } else if (menu.state === MENU_STATE_HELP) {

        if (menu.demo) {
            return
        }
        switch (key) {
            
            case 'w':
            case 'GamepadsUp':
            case 'Gamepads12':
            case 'ArrowUp':
                menu.helpContainer.pageIndex--
            break;
            case 's':
            case 'Gamepads13':
            case 'GamepadsDown':
            case 'ArrowDown':
                menu.helpContainer.pageIndex++
                break;
            case 'Gamepads0':
            case 'Enter':    
            case ' ': 
            if ( menu.helpContainer.position.y+ menu.helpText.height < menu.app.screen.height*0.75) {
                menu.state = MENU_STATE_LEVELS
                menu.helpContainer.pageIndex = 0
            } else {
                menu.helpContainer.pageIndex++
            }
            break;

            case 'Gamepads1':
            case 'Gamepads9':
            case 'Escape':
                menu.state = MENU_STATE_LEVELS
                menu.helpContainer.pageIndex = 0
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
                        menu.state = MENU_STATE_HELP
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
    } else if (menu.state === MENU_STATE_HELP) {

        if (menu.demo) {
            return
        }
        if ( menu.helpContainer.position.y+ menu.helpText.height < menu.app.screen.height*0.75) {
            menu.state = MENU_STATE_LEVELS
            menu.helpContainer.pageIndex = 0
        } else {
            menu.helpContainer.pageIndex++
        }
        
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
            menu.state = MENU_STATE_HELP
            SoundManager.playSFX('trade_won1')
        } 
    }
    

}

function updateMenu(menu, app, deltaTime, getMute, getWin, particles) {
    let scaleToFullHD = app.screen.width/1920
    menu.app = app
    menu.background.scale.set(app.screen.width / 1024, app.screen.height / 1024)
    menu.background.alpha = 0.0
    menu.audioButtonSprite.scale = (menu.audioButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.audioButtonSprite.position.set(app.screen.width - menu.audioButtonSprite.width * 1.2, app.screen.height -menu.audioButtonSprite.height * 1.5 )
    menu.audioButtonSprite.texture = getMute() ? menu.audioOffTexture : menu.audioOnTexture

    menu.musicButtonSprite.scale = (menu.musicButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.musicButtonSprite.position.set(app.screen.width - menu.musicButtonSprite.width * 2.5, app.screen.height -menu.musicButtonSprite.height * 1.5 )
    menu.musicButtonSprite.texture = getMute('music') ? menu.musicOffTexture : menu.musicOnTexture


    menu.helpButtonSprite.scale = (menu.helpButtonSprite.active ? 1.1 : 1.0) * 0.2
    menu.helpButtonSprite.position.set(menu.helpButtonSprite.width * 0.2, app.screen.height -menu.helpButtonSprite.height * 1.5 )
   

    menu.helpButtonSprite.up = menu.musicButtonSprite.up = menu.audioButtonSprite.up = menu.levelEntries[menu.levelEntries.length-1]
    menu.helpButtonSprite.down = menu.musicButtonSprite.down = menu.audioButtonSprite.down = menu.levelEntries[0]



    menu.title.scale.set(4*scaleToFullHD*0.5)
    menu.subtitle.scale.set(scaleToFullHD)
    menu.finaltitle.position.set(app.screen.width*0.5, app.screen.height)
    let index = Math.floor((deltaTime.lastTime*0.0002) % menu.finaltitle.texts.length)
    menu.finaltitle.text = menu.finaltitle.texts[index]
        
    menu.finaltitle.scale.set(scaleToFullHD)

    menu.spritePlayer.scale = menu.spriteHodler.scale = 0.25*(Math.min(1080,Math.max(640,app.screen.width))/640.0)
    menu.spritePlayer.y = app.screen.height*0.8 + Math.cos(deltaTime.lastTime*0.002)*app.screen.height*0.02
    menu.spriteHodler.y = app.screen.height*0.8 + Math.sin(deltaTime.lastTime*0.001)*app.screen.height*0.01
    if (menu.state === MENU_STATE_INTRO) {
        menu.spriteHodler.x = app.screen.width*0.75
        menu.spritePlayer.x = app.screen.width*0.25
        menu.helpContainer.visible = menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.musicButtonSprite.visible = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = false
        menu.title.visible = menu.clickTitle.visible = true
        menu.textStyleClick.wordWrapWidth = app.screen.width*0.75*2
        if (app.screen.width < 1280) {
            menu.clickTitle.text = menu.clickTitle.textMobile
            menu.clickTitle2.text = menu.clickTitle2.textMobile
        } else {
            menu.clickTitle.text = menu.clickTitle.textDesktop
            menu.clickTitle2.text = menu.clickTitle2.textDesktop
        }
        menu.clickTitle.scale = 0.5
        menu.clickTitle.position.set(app.screen.width*0.5, app.screen.height)
        menu.clickTitle2.scale = 1.0
        menu.clickTitle2.position.set(app.screen.width*0.5, app.screen.height*0.85)
        menu.clickTitle.alpha =  1.0
        menu.clickTitle2.alpha =  deltaTime.lastTime % 2000 > 500 ? 1.0 : 0.0
        menu.clickTitle.rotation =Math.sin(deltaTime.lastTime*0.01)*0.01

        menu.title.scale.set(4*Math.min(1,scaleToFullHD)*0.5)
        menu.subtitle.scale.set(4*Math.min(0.5,scaleToFullHD)*0.25)
        menu.title.position.set(app.screen.width*0.5, app.screen.height*0.1)
        menu.subtitle.position.set(app.screen.width*0.5, app.screen.height*0.15)
       // menu.subtitle.rotation = menu.title.rotation = -10*Math.PI/360

    } else if (menu.state === MENU_STATE_HELP) {
     
        menu.spriteHodler.x = 0.9* menu.spriteHodler.x + 0.1*app.screen.width*1.05 
        menu.spritePlayer.x = 0.9*menu.spritePlayer.x + 0.1*-app.screen.width*0.05
        menu.title.position.set(0.9*menu.title.position.x+0.1*app.screen.width*0.5, 0.9*menu.title.position.y+0.1*app.screen.height*0.05)
        menu.subtitle.rotation = menu.title.rotation = 0
        menu.subtitle.position.set(0.9*menu.subtitle.position.x+0.1*app.screen.width*0.5, 0.9*menu.subtitle.position.y+0.1*app.screen.height*0.0)
     
        menu.subtitle.visible = menu.title.visible = menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.musicButtonSprite.visible = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = false
        menu.helpContainer.visible = true
        menu.helpText.scale = 0.75
        menu.textStyleHelper.wordWrap= true
        menu.textStyleHelper.wordWrapWidth = app.screen.width > 1920 ? app.screen.width*0.8 : app.screen.width
        menu.helpContainer.position.set(app.screen.width*0.5, menu.title.y + menu.title.height - menu.helpContainer.pageIndex*app.screen.height*0.25 )
    

        if (menu.demo) {
            menu.title.visible = true
            menu.spriteHodler.visible = menu.spritePlayer.visible = menu.helpContainer.visible = false
        }
    } else if (menu.state === MENU_STATE_LEVELS) {
        menu.spriteHodler.x = 0.9* menu.spriteHodler.x + 0.1*app.screen.width*1.05 
        menu.spritePlayer.x = 0.9*menu.spritePlayer.x + 0.1*-app.screen.width*0.05
        menu.helpContainer.visible = false
        menu.clickTitle.alpha*=0.92
        menu.clickTitle2.alpha*=0.92
        menu.title.visible = menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.musicButtonSprite.visible = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = true
        menu.subtitle.alpha*=0.92
       menu.title.position.set(0.9*menu.title.position.x+0.1*app.screen.width*0.5, 0.9*menu.title.position.y+0.1*app.screen.height*0.05)
        menu.subtitle.rotation = menu.title.rotation = 0
        menu.subtitle.position.set(0.9*menu.subtitle.position.x+0.1*app.screen.width*0.5, 0.9*menu.subtitle.position.y+0.1*app.screen.height*0.0)
    }

    let cw = app.screen.width * 0.9
    let ch = app.screen.height *0.9 - menu.levelGroupsContainer.position.y
    let cols = cw > ch*2 ? 5 : 4 
    let rows = cw > ch*2 ? 4 : 5
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
            entry.indexSubText.scale.set(0.25* (Math.max(640, app.screen.width)/640)* (entry.active ? 1.1 : 1.0)) 
            entry.indexSubText.position.set(0,  entry.indexText.height*0.5)
            entry.indexText.position.set(0,  -entry.indexText.height*0.25)
            let win = getWin(entry.level.name)
            let score = 100*(win?.p || 1.0)-100

            if (getQueryParam('win')) {
                win = {hodled:true}
            }
            entry.isCompleted = win?.hodled
            entry.isCompletedLevelBefore = index2 === 0 || getWin(group.levelEntries[index2-1].level.name)?.hodled
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

            entry.indexBackground.scale.x = (entry.active && (true || entry.isCompletedLevelBefore) ? 1.0 : 0.9) * colw
            entry.indexBackground.scale.y = (entry.active && (true || entry.isCompletedLevelBefore) ? 1.0 : 0.9) * colh
            
            entry.index.alpha = entry.active && entry.isCompletedLevelBefore ? 1.0 : 1.0

            if (entry.indexSubText.value !== score)  {
                entry.indexSubText.value = score
                if (score === true || score === null) {
                    entry.indexSubText.text = ''
                } else {
                    entry.indexSubText.text =  score > 0 ? '+' + (score).toFixed(0) + '%' : score.toFixed(0) + '%'
                }

                
                if (entry.level.difficulty <= 2) {
                    entry.indexDifficultyLabel.text = 'NORMAL'
                    entry.indexDifficultyBackground.tint = 0x00ff00
                } else if (entry.level.difficulty < 5) {
                    entry.indexDifficultyLabel.text = 'HARD'
                    entry.indexDifficultyBackground.tint = 0xffff00
                } else {
                    entry.indexDifficultyLabel.text = 'BRUTAL'
                    entry.indexDifficultyBackground.tint = 0xff0000
                }
                

            }

            let color;
            if (score > -1 && score < 1) {
                color = 0x000000
            } else if (score > 1) {
                color = 0x005500
            } else {
                color = 0x550000
            }

            if (menu.isCompleted ) {
                color = 0xF7931B
            }
            entry.indexBackground.tint = color
            entry.indexDifficultyLabel.scale = entry.indexSubText.scale
            entry.indexDifficultyContainer.position.set( entry.indexBackground.scale.x*0.5,-entry.indexBackground.scale.y*0.5)
            entry.indexDifficultyBackground.scale.set(entry.indexDifficultyLabel.width*1.1, entry.indexDifficultyLabel.height*1.1)
            
            entry.indexCompletedContainer.position.set(-entry.indexBackground.scale.x*0.5,-entry.indexBackground.scale.y*0.5)
            entry.indexCompletedGraphics.scale.set(entry.indexDifficultyLabel.height, entry.indexDifficultyLabel.height)
            entry.indexCompletedContainer.visible = entry.isCompleted
        })
        group.isCompleted = group.levelEntries.every(l => l.isCompleted)
    })

    menu.isCompleted =  menu.levelGroups.every(l => l.isCompleted)
    
    

    if(menu.isCompleted) {
        menu.title.text = 'You are the HODLer'
        menu.subtitle.text = 'Congratulations'
        menu.clickTitle2.text = ''
        menu.title.rotation = Math.sin(deltaTime.lastTime*0.01)*0.1
        particles.forEach((p,i) => {
            p.x = Math.random() * app.screen.width
            p.y = Math.random() * app.screen.height
            const faceWidth = app.screen.width * 0.5;
            const faceHeight = faceWidth;
            const centerX = app.screen.width * 0.5;
            const centerY = menu.subtitle.y + menu.subtitle.height + faceHeight*0.75;
        
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
                const t = (i - 2) / (particles.length - 3); // Normierung [0, 1]
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



        })


    } else {
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
    
}