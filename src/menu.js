function createMenu(gameData, app, textStyle, textStyleCentered) {
    menu = new PIXI.Container()


    menu.background = new PIXI.Graphics();
    menu.addChild(menu.background)

    menu.title = new PIXI.Text('Bitcoin Time Trader', textStyleCentered)
    menu.title.position.set(app.screen.width*0.5, app.screen.height*0.5)
    menu.title.anchor.set(0.5,0.5)
    menu.addChild(menu.title)

    return menu
}

function updateMenu(menu, app, deltaTime) {
    menu.title.position.set(app.screen.width*0.5, app.screen.height*0.1)

    menu.background
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000 });
}