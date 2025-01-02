async function createMenu(gameData, app, coins, textStyle, textStyleCentered) {


    let menu = new PIXI.Container()
    menu.gameData = gameData

    menu.textStyleTitle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 128,
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

    menu.textStylePreview = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 32,
        stroke: { color: '#fff', width: 5, join: 'round' },
    });




    menu.background = new PIXI.Graphics();
    menu.addChild(menu.background)

    menu.title = new PIXI.Text('Bitcoin Trader', menu.textStyleTitle)
    menu.title.anchor.set(0.5,0.0)
    menu.addChild(menu.title)

    menu.subtitle = new PIXI.Text('Can u beat the Hodler?', menu.textStyleTitle)
    menu.subtitle.anchor.set(0.5,-2.0)
    menu.addChild(menu.subtitle)
    menu.subtitle.scale = 0.5

    menu.finaltitle = new PIXI.Text('Made by Alexander Thurn', menu.textStyleTitle)
    menu.finaltitle.anchor.set(0.5,1.0)
    menu.addChild(menu.finaltitle)
    menu.finaltitle.scale = 0.5

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
        //e.title = new PIXI.Text(level.name + ' ' + level.coinNames + ' ' + level.stops.length, textStyleCentered)
        e.title = new PIXI.Text(e.level.name, textStyleCentered)
        e.title.anchor.set(1,0.5)
        e.addChild(e.title)
        e.title.visible = false

        e.stops = new PIXI.Text((e.level.stops.length-1) + 'x', textStyleCentered)
        e.stops.anchor.set(-2,0.5)
        e.addChild(e.stops)
        e.stops.visible = false
        
        e.logos = new PIXI.Container()
        e.level.coinNames.forEach(coinName => {
            const logoSprite = new PIXI.Sprite(coins[coinName].texture);
            logoSprite.anchor.set(0,0.5)
            e.logos.addChild(logoSprite)
        })
       
        e.addChild(e.logos)   
        e.logos.visible = false

        e.index = new PIXI.Container()
        e.indexText = new PIXI.Text(index+1, menu.textStylePreview)
        e.indexBackgroundRadius = 128
        e.indexBackground = new PIXI.Graphics().circle(0,0,e.indexBackgroundRadius).fill(0xF7931B, 1).stroke({color: 0xffffff, width:e.indexBackgroundRadius*0.1})
        e.index.addChild(e.indexBackground)
        e.index.addChild(e.indexText)
        e.indexText.anchor.set(0.5,0.5)
        e.addChild(e.index)


        let group = menu.levelGroups.find(group => group.name === e.level.group)
        group.levels.addChild(e)
        group.levelEntries.push(e)
        return e
    })

    menu.levelGroupsContainer.addChild(...menu.levelGroups)

    menu.audioOnTexture = await PIXI.Assets.load({src: 'gfx/audio_on.png'})
    menu.audioOffTexture = await PIXI.Assets.load({src: 'gfx/audio_off.png'})

    menu.audioButtonSprite = new PIXI.Sprite(menu.audioOnTexture);
    menu.addChild(menu.audioButtonSprite)
    return menu
}

function containsPoint(x,y,bounds) {
    return x > bounds[0] && x < bounds[2] && y > bounds[1] && y < bounds[3]
}
function menuPointerMoveEvent(menu, event) {
    menu.levelEntries.forEach((entry,index2) => {
        entry.active = entry.getBounds().containsPoint(event.x,event.y)
    })
    menu.audioButtonSprite.active = menu.audioButtonSprite.getBounds().containsPoint(event.x,event.y)
}

function menuPointerUpEvent(menu, event, startNewGame, getMute, setMute) {
    menu.levelEntries.forEach((entry,index2) => {
        if (entry.getBounds().containsPoint(event.x,event.y)) {
            if (!entry.active) {
                entry.active = true
            } else {
                menu.visible = false
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

}

function updateMenu(menu, app, deltaTime, getMute) {

    //menu.audioButtonSprite.width = menu.audioButtonSprite.height= app.screen.width*0.075
    menu.audioButtonSprite.scale = (menu.audioButtonSprite.active ? 0.4 : 0.3)
    menu.audioButtonSprite.alpha = (menu.audioButtonSprite.active ? 1.0 : 0.7)
   // menu.audioButtonSprite.rotation = (menu.audioButtonSprite.active ? Math.sin(deltaTime.lastTime*0.1)*0.05 : 0.0) 
    menu.audioButtonSprite.position.set(app.screen.width - menu.audioButtonSprite.width * 1.2, app.screen.height -menu.audioButtonSprite.height * 1.2 )
    menu.audioButtonSprite.texture = getMute() ? menu.audioOffTexture : menu.audioOnTexture
    //menu.textStyleTitle.fontSize = Math.max(64, (Math.max(app.renderer.height, app.renderer.width) / 1080)*64)
    //menu.textStyleTitle.stroke.width =  
    menu.textStyleTitle.fontSize = 128*Math.min(1.0, app.screen.width/1920)
    menu.title.position.set(app.screen.width*0.5, app.screen.height*0.0)
    menu.subtitle.rotation = menu.title.rotation = Math.sin(deltaTime.lastTime*0.001)*0.01
    menu.subtitle.position.set(app.screen.width*0.5, app.screen.height*0.0)
    menu.finaltitle.position.set(app.screen.width*0.5, app.screen.height)
    
    menu.background
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0xf4b400 });
    
    let cw = app.screen.width * 0.9
    let ch = app.screen.height *0.9 - menu.levelGroupsContainer.position.y
    let cols = cw > ch ? 7 : 3 
    let rows = cw > ch ? 3 : 7
    let colw = cw / cols
    let colh = ch / rows
    colh = Math.min(colw, colh)
    ch = colh * rows
    menu.levelGroupsContainer.position.set(0.5*(app.screen.width - cw), 20+menu.subtitle.position.y - menu.subtitle.height*menu.subtitle.anchor.y + menu.subtitle.height + (app.screen.height*0.9 - menu.levelGroupsContainer.position.y -ch)*0.5)
    
    menu.levelGroups.forEach((group,index) => {
       // group.position.set(0, 0)
      //  group.title.position.set(0,0)
        
        //y+= group.title.height*2
       // x = app.screen.width*0.1

        group.levelEntries.forEach((entry,index2) => {
            
            entry.position.set((index2 % cols) * colw + colw*0.5,Math.floor(index2 / cols)*colh + colh*0.5)
            //let posGlobal = entry.getGlobalPosition()
           // entry.bounds = [posGlobal.x, posGlobal.y, posGlobal.x+colw, posGlobal.y+colh]
            entry.indexBackground.scale = (entry.active ? 1.3 : 1.0) * Math.max(0.20, 0.25*Math.min(colw,colh) / entry.indexBackgroundRadius)
      
            entry.index.rotation = Math.sin(deltaTime.lastTime*0.01- (10000/group.levelEntries.length)*index2)*0.1
            entry.index.alpha = entry.active ? 1.0 : (deltaTime.lastTime - (1000/group.levelEntries.length)*index2) % 15000 > 5000 ? 0.5 : 0.3 
          
           
            if (index2 > 0) {
                entry.index.rotation = 0
                entry.index.alpha *= 0.5
            }

         /*   entry.position.set(0, group.title.height*2+index2*entry.title.height)
            
            entry.logos.children.forEach((child, index3) => {
                child.scale = 0.01
                child.position.x = (index3+1)*child.width*0.33
            })

            y+=entry.title.height

            entry.scale = entry.active ? 1.1 : 1.0
            entry.rotation = entry.active ? Math.sin(deltaTime.lastTime*0.01)*0.01 : 0.0
            */
        })
    })

}