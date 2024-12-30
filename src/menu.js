function createMenu(gameData, app, coins, textStyle, textStyleCentered) {


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




    menu.background = new PIXI.Graphics();
    menu.addChild(menu.background)

    menu.title = new PIXI.Text('Bitcoin Time Trader', menu.textStyleTitle)
    menu.title.anchor.set(0.5,0.0)
    menu.addChild(menu.title)

    menu.subtitle = new PIXI.Text('Can you beat the Hodler?', menu.textStyleTitle)
    menu.subtitle.anchor.set(0.5,-2.0)
    menu.addChild(menu.subtitle)
    menu.subtitle.scale = 0.5

    menu.levels = new PIXI.Container()
    menu.addChild(menu.levels)

    menu.levelGroups = gameData.groups.map(group => {
        let e = new PIXI.Container()
        e.title = new PIXI.Text(group.name, textStyle)
        e.title.anchor.set(0,0.0)
        e.addChild(e.title)
        e.name = group.name
        e.levelEntries = []
        e.levels = new PIXI.Container()
        e.addChild(e.levels)
        return e
    })

    menu.levelEntries = gameData.levels.map((level,index) => {
        let e = new PIXI.Container()
        e.level = level
        e.group = e.level.group
        //e.title = new PIXI.Text(level.name + ' ' + level.coinNames + ' ' + level.stops.length, textStyleCentered)
        e.title = new PIXI.Text(e.level.name, textStyleCentered)
        e.title.anchor.set(1,0.5)
        e.addChild(e.title)

        e.stops = new PIXI.Text((e.level.stops.length-1) + 'x', textStyleCentered)
        e.stops.anchor.set(-2,0.5)
        e.addChild(e.stops)

        e.logos = new PIXI.Container()
        e.level.coinNames.forEach(coinName => {
            const logoSprite = new PIXI.Sprite(coins[coinName].texture);
            logoSprite.anchor.set(0,0.5)
            e.logos.addChild(logoSprite)
        })
       
        e.addChild(e.logos)   

        let group = menu.levelGroups.find(group => group.name === e.level.group)
        group.levels.addChild(e)
        group.levelEntries.push(e)
        return e
    })

    menu.levels.addChild(...menu.levelGroups)
    return menu
}

function menuPointerMoveEvent(menu, event) {
    menu.levelEntries.forEach((entry,index2) => {
        entry.active = entry.getBounds().containsPoint(event.x,event.y)
    })
}

function menuPointerUpEvent(menu, event, startNewGame) {
    menu.levelEntries.forEach((entry,index2) => {
        if (entry.active) {
            menu.visible = false
            startNewGame(entry.level)
        }
        entry.active = false
    })

}

function updateMenu(menu, app, deltaTime) {
    //menu.textStyleTitle.fontSize = Math.max(64, (Math.max(app.renderer.height, app.renderer.width) / 1080)*64)
    //menu.textStyleTitle.stroke.width =  
    menu.textStyleTitle.fontSize = 128*Math.min(1.0, app.screen.width/1920)
    menu.title.position.set(app.screen.width*0.5, app.screen.height*0.0)
    menu.subtitle.rotation = menu.title.rotation = Math.sin(deltaTime.lastTime*0.001)*0.01
    menu.subtitle.position.set(app.screen.width*0.5, app.screen.height*0.0)
    
    menu.background
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000 });
    menu.levels.position.set(app.screen.width*0.5, menu.subtitle.position.y - menu.subtitle.height*menu.subtitle.anchor.y + menu.subtitle.height + 50)
    
    let y = 0
    menu.levelGroups.forEach((group,index) => {
        group.position.set(0, y)
        group.title.position.set(0,0)
        
        y+= group.title.height*2

        group.levelEntries.forEach((entry,index2) => {
            entry.position.set(0, group.title.height*2+index2*entry.title.height)
            
            entry.logos.children.forEach((child, index3) => {
                child.scale = 0.01
                child.position.x = (index3+1)*child.width*0.33
            })

            y+=entry.title.height

            entry.scale = entry.active ? 1.1 : 1.0
            entry.rotation = entry.active ? Math.sin(deltaTime.lastTime*0.01)*0.01 : 0.0
        })
    })

}