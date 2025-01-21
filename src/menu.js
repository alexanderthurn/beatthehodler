const MENU_STATE_INTRO = 1
const MENU_STATE_LEVELS = 2
const MENU_STATE_HELP = 3




async function createMenu(gameData, app, coins, textStyle, textStyleCentered, textureHodler, texturePlayer) {


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
    
    menu.title = new PIXI.Text('Beat the Hodler', menu.textStyleTitle)
    menu.title.anchor.set(0.5,0.0)
    menu.addChild(menu.title)

    menu.subtitle = new PIXI.Text('Can you win by trading?', menu.textStyleTitle)
    menu.subtitle.anchor.set(0.5,-2.0)
    menu.addChild(menu.subtitle)

    menu.finaltitle = new PIXI.Text('by Alexander Thurn', menu.textStyleTitle)
    menu.finaltitle.anchor.set(0.5,1.0)
    menu.addChild(menu.finaltitle)

    menu.clickTitle = new PIXI.Text('A "Hodler" holds, no matter what!', menu.textStyleClick) 
    menu.clickTitle.textMobile = 'A "Hodler" holds,\n no matter what!'
    menu.clickTitle.textDesktop = 'A "Hodler" holds, no matter what!'

    menu.clickTitle.anchor.set(0.5,1.5)
    menu.addChild(menu.clickTitle)

    menu.levelGroupsContainer = new PIXI.Container()
    menu.addChild(menu.levelGroupsContainer)

    menu.levelGroups = gameData.groups.map(group => {
        let e = new PIXI.Container()
        e.title = new PIXI.Text(group.name, textStyle)
        e.title.anchor.set(0,0.0)
        e.addChild(e.title)
        e.name = group.name
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
        e.indexText = new PIXI.Text(e.level.name, menu.textStylePreview)
        e.indexSubText = new PIXI.Text('0%', menu.textStylePreviewSub)
        e.indexSubText.value = 0.0
        e.indexBackgroundRadius = 512
       // e.indexBackground = new PIXI.Graphics().circle(0,0,e.indexBackgroundRadius).fill(0xF7931B, 1).stroke({color: 0xffffff, width:e.indexBackgroundRadius*0.1})
        e.indexBackground = new PIXI.Graphics().rect(-e.indexBackgroundRadius, -e.indexBackgroundRadius/2,e.indexBackgroundRadius*2, e.indexBackgroundRadius).fill(0xF7931B, 1).stroke({color: 0xffffff, width:e.indexBackgroundRadius*0.025})
        
        e.index.addChild(e.indexBackground)
        e.index.addChild(e.indexText)
        e.index.addChild(e.indexSubText)
        e.indexText.anchor.set(0.5,0.5)
        e.indexSubText.anchor.set(0.5,0.5)
        e.addChild(e.index)


        let group = menu.levelGroups.find(group => group.name === e.level.group)
        group.levels.addChild(e)
        group.levelEntries.push(e)
        return e
    })

    menu.levelGroupsContainer.addChild(...menu.levelGroups)

    menu.audioOnTexture = await PIXI.Assets.load({src: 'gfx/audio_on.png'})
    menu.audioOffTexture = await PIXI.Assets.load({src: 'gfx/audio_off.png'})
    menu.helpTexture = await PIXI.Assets.load({src: 'gfx/help.png'})

    menu.audioButtonSprite = new PIXI.Sprite(menu.audioOnTexture);
    menu.addChild(menu.audioButtonSprite)
    menu.audioButtonSprite.scale =  0.20

    menu.helpButtonSprite = new PIXI.Sprite(menu.helpTexture);
    menu.addChild(menu.helpButtonSprite)
    menu.helpButtonSprite.scale =  0.20

    return menu
}


function menuPointerMoveEvent(menu, event) {
    menu.levelEntries.filter(entry =>  true || entry.isCompletedLevelBefore ).forEach((entry,index2) => {
        entry.active = entry.getBounds().containsPoint(event.x,event.y)
    })
    menu.audioButtonSprite.active = menu.audioButtonSprite.getBounds().containsPoint(event.x,event.y)   
    menu.helpButtonSprite.active = menu.helpButtonSprite.getBounds().containsPoint(event.x,event.y)

}

function menuPointerUpEvent(menu, event, startNewGame, getMute, setMute, showMenu) {
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
        } 
    
        if (menu.helpButtonSprite.getBounds().containsPoint(event.x,event.y)) {
            //setMute(!getMute())
        } 
    }
    

}

function updateMenu(menu, app, deltaTime, getMute, getWin) {
    menu.background.scale.set(app.screen.width / 1024, app.screen.height / 1024)
    menu.background.alpha = 0.0
    menu.audioButtonSprite.alpha = (menu.audioButtonSprite.active ? 1.0 : 0.7)
    menu.audioButtonSprite.position.set(app.screen.width - menu.audioButtonSprite.width * 1.2, app.screen.height -menu.audioButtonSprite.height * 1.2 )
    menu.audioButtonSprite.texture = getMute() ? menu.audioOffTexture : menu.audioOnTexture

    menu.helpButtonSprite.alpha = (menu.helpButtonSprite.active ? 1.0 : 0.7)
    menu.helpButtonSprite.position.set(menu.helpButtonSprite.width * 0.2, app.screen.height -menu.helpButtonSprite.height * 1.2 )
   

    let scaleToFullHD = app.screen.width/1920

    menu.title.scale.set(4*scaleToFullHD*0.5)
    menu.subtitle.scale.set(4*scaleToFullHD*0.25)
    menu.finaltitle.scale.set(4*scaleToFullHD*0.25)
    menu.finaltitle.position.set(app.screen.width*0.5, app.screen.height)

    menu.spritePlayer.width = menu.spriteHodler.width = menu.spritePlayer.height = menu.spriteHodler.height = Math.min(app.screen.height, app.screen.width)*0.5

    menu.spritePlayer.y = app.screen.height + Math.cos(deltaTime.lastTime*0.002)*app.screen.height*0.02
    menu.spriteHodler.y = app.screen.height + Math.sin(deltaTime.lastTime*0.001)*app.screen.height*0.01
    if (menu.state === MENU_STATE_INTRO) {
        menu.spriteHodler.x = app.screen.width 
        menu.spritePlayer.x = 0
        menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = false
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
        menu.spriteHodler.x = 0.9* menu.spriteHodler.x + 0.1*app.screen.width*1.1 
        menu.spritePlayer.x = 0.9*menu.spritePlayer.x + 0.1*-app.screen.width*0.1

        menu.clickTitle.alpha*=0.92
        menu.finaltitle.visible = menu.levelGroupsContainer.visible  = menu.audioButtonSprite.visible = menu.helpButtonSprite.visible = true
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
        
        menu.levelGroups.forEach((group,index) => {
            group.levelEntries.forEach((entry,index2) => {
                entry.indexText.scale.set(0.4* (Math.max(640, app.screen.width)/640))
                entry.indexSubText.scale.set(0.3* (Math.max(640, app.screen.width)/640)) 
                entry.indexSubText.position.set(0,  entry.indexText.height/2)
                entry.indexText.position.set(0,  -entry.indexText.height/2)
                let score = getWin(entry.level.name)
                entry.isCompleted = score > 0
                entry.isCompletedLevelBefore = index2 === 0 || getWin(group.levelEntries[index2-1].level.name)
                entry.position.set((index2 % cols) * colw + colw*0.5,Math.floor(index2 / cols)*colh + colh*0.5)
    
                entry.indexBackground.scale = (entry.active && (true || entry.isCompletedLevelBefore) ? 1.0 : 0.9) * Math.min(colw / (entry.indexBackgroundRadius*2), colh / (entry.indexBackgroundRadius))
                //entry.index.rotation = 0
                entry.index.alpha = entry.active && entry.isCompletedLevelBefore ? 1.0 : 1.0
    
                if (entry.indexSubText.value !== score)  {
                    entry.indexSubText.value = score
                    if (score === true || score === null) {
                        entry.indexSubText.text = ''
                    } else {
                        entry.indexSubText.text =  score > 0 ? '+' + (500*score).toFixed(0) + '%' : score.toFixed(0) + '%'
                    }
                }

                if (entry.isCompleted) {
                  //  entry.index.rotation = 0
                  //  entry.index.alpha = entry.active ? 1.0 : (deltaTime.lastTime - (1000/group.levelEntries.length)*index2) % 15000 > 5000 ? 1.0 : 1.0 
              
                } else if (entry.isCompletedLevelBefore){
                   // entry.index.alpha = entry.active ? 1.0 : (deltaTime.lastTime - (1000/group.levelEntries.length)*index2) % 1000 > 500 ? 1.0 : 0.5 
                    //entry.index.rotation = Math.sin(deltaTime.lastTime*0.01- (10000/group.levelEntries.length)*index2)*0.01
                }
            })
        })

    }
   
    
    
    

}