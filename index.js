function formatCurrency(amount, currency, fractionDigits, abbreviate = false) {

    const locale = navigator.language;

    let formatted;

    if (abbreviate) {
        const suffixes = ['', 'K', 'M', 'B', 'T']; // Tausend, Million, Milliarde, Billion
        let tier = Math.floor(Math.log10(Math.abs(amount)) / 3); // Bestimmen des Tiers
        tier = Math.min(tier, suffixes.length - 1); // Begrenzen auf verfügbare Suffixe

        // Abkürzung erst ab zwei Stellen verwenden
        if (tier >= 1) { // Abkürzen ab Tausender (1 oder mehr Stellen im Tier)
            const scale = Math.pow(10, tier * 3); // Skalieren der Zahl
            const scaledValue = amount / scale;

            formatted = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }).format(scaledValue);

            // Suffix hinzufügen
            formatted += suffixes[tier];
        } else {
            // Keine Abkürzung, normale Formatierung
            formatted = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }).format(amount);
        }
    } else {
        formatted = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(amount);
    }

    // Bitcoin-Symbol hinzufügen, falls die Währung BTC ist
    if (currency === 'BTC') {
        formatted = formatted.replace(currency, "\u20BF"); // Symbol manuell ersetzen
    }

    return formatted;
}




// Funktion, um CSV-Daten in ein Array von Objekten zu konvertieren
function parseCSV(csvString) {
    const lines = csvString.split('\n'); // Aufteilen nach Zeilen
    const headers = lines[0].split(',').map(h => h.trim()); // Erste Zeile als Header verwenden
    function parseDate(dateString) {
        // ISO-Format sicherstellen
        return new Date(dateString.replace(" ", "T").replace(" UTC", "Z"));
    }
    // Restliche Zeilen in Objekte umwandeln
    const data = lines.slice(1).filter(line => line?.length > 0).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] ? values[index].trim() : null;
            if (header === 'snapped_at') {
                obj[header] = parseDate(obj[header])
            } else  if (header === 'price') {
                obj[header] = parseFloat(obj[header])
            } 
            return obj;
        }, {});
    });

    return data;
}

// Funktion, um die CSV-Datei zu laden und zu parsen
async function fetchCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Datei: ${response.statusText}`);
        }
        const csvString = await response.text();
        return parseCSV(csvString);
    } catch (error) {
        console.error("Fehler beim Laden der CSV-Datei:", error);
        return [];
    }
}

// Funktion, um den Graphen mit Pixi.js zu zeichnen
async function drawGraph(filePath) {
    const parsedData = await fetchCSV(filePath);
    if (!parsedData.length) return;

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });
    await app.init({ background: '#000', resizeTo: window });
    document.body.appendChild(app.canvas);

    let gradientWidth = app.renderer.width; 
    let gradientHeight = app.renderer.height * 0.5; 
    let gradientFill = new PIXI.FillGradient(0, gradientHeight, 0, app.renderer.height);
    gradientFill.addColorStop(0, 0x000000);
    gradientFill.addColorStop(0.7, 0x000000);
    gradientFill.addColorStop(1, 0xffa500);
    const graphic1 = new PIXI.Graphics().drawRect(0, app.renderer.height - gradientHeight, gradientWidth, gradientHeight).fill(gradientFill);
    app.stage.addChild(graphic1);



    const graph = new PIXI.Graphics();
    app.stage.addChild(graph);


    PIXI.Assets.addBundle('fonts', {
        XoloniumBold: {
            src: './XoloniumBold-xKZO.ttf',
            data: { family: 'Xolonium Bold' },
        },
        Xolonium: {
            src: './Xolonium-pn4D.ttf',
            data: { family: 'Xolonium' },
        },
    });

    await PIXI.Assets.loadBundle('fonts')

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Xolonium',
        fontStyle: 'Bold',
        fontSize: 36,
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
    
    const dateLabel = new PIXI.Text("", textStyle);
    dateLabel.anchor.set(0.0,0.0)
    app.stage.addChild(dateLabel);

    const priceLabel = new PIXI.Text("", textStyle);
    priceLabel.anchor.set(1.5,1.0)
    app.stage.addChild(priceLabel);

    const bitcoinSvg = await PIXI.Assets.load({
        src: './bitcoin.png',
    });
    const bitcoinLogo = new PIXI.Sprite(bitcoinSvg);
    app.stage.addChild(bitcoinLogo);
    bitcoinLogo.anchor.set(0.5,0.5)

    const stackLabel = new PIXI.Text("", textStyle);
    stackLabel.anchor.set(0.5,1.0)
    app.stage.addChild(stackLabel);



    let yourCoins = 0
    let yourFiat = 1000
    let paused = Number.MAX_VALUE
    let buyPaused = 2000
    const maxVisiblePoints = 100; // Anzahl der sichtbaren Punkte im Graph
    const trades = []
    
    addEventListener('pointerup', () => {
        let price = parsedData[currentIndex].price
        let trade =  {
            index: currentIndex, 
            price: price, 
            coins: yourCoins, 
            fiat: yourFiat,
            sprite: new PIXI.Sprite(bitcoinSvg)
        }
        app.stage.addChild(trade.sprite);
        trade.sprite.anchor.set(0.5,0.5)
        trades.push(trade)
        
        if (yourCoins > 0) {
            trade.coins = yourCoins
            yourFiat = yourCoins * price
            yourCoins = 0
        } else {
            trade.fiat = yourFiat
            yourCoins = yourFiat / price
            yourFiat = 0
        }
        paused = buyPaused
    })



    let currentIndex = 0
    const gameDurationMilliseconds = 90000
    const factorMilliSeconds =  parsedData.length / gameDurationMilliseconds; // Intervall in Sekunden
    let elapsedTime = maxVisiblePoints; // Zeitverfolgung
   
    app.ticker.add((deltaTime) => {

  
        let gradientWidth = app.renderer.width; 
       let gradientHeight = app.renderer.height * 0.5; 
       let gradientFill = new PIXI.FillGradient(0, gradientHeight, 0, app.renderer.height);
       gradientFill.addColorStop(0, 0x000000);
       gradientFill.addColorStop(0.7, 0x000000);
       if (yourCoins > 0) {
        gradientFill.addColorStop(1, 0xffa500);
       } else {
        gradientFill.addColorStop(1, 0x00a500);
       }
        graphic1.clear();
        graphic1.drawRect(0, app.renderer.height - gradientHeight,gradientWidth, gradientHeight).fill(gradientFill);

        

        if (paused <= 0) {
            elapsedTime += deltaTime.elapsedMS*factorMilliSeconds;
        } else {
            paused -= deltaTime.elapsedMS
            if (paused < buyPaused) {
                elapsedTime += deltaTime.elapsedMS*factorMilliSeconds*(Math.max(0,(buyPaused-paused*2)/buyPaused));
            }
        }

        currentIndex = Math.floor(elapsedTime)

        if (currentIndex > parsedData.length-1) {
            currentIndex = parsedData.length -1
        } 

        if (currentIndex < maxVisiblePoints) {
            currentIndex = maxVisiblePoints
        } 

        

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyle.fontSize = Math.max(32, (Math.max(app.renderer.height, app.renderer.width) / 1080)*36)

        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width

        graph.clear();

        const stepX = app.renderer.width / maxVisiblePoints * 0.85;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndex-maxVisiblePoints; i <= currentIndex; i++) {
            maxPrice = Math.max(maxPrice, parsedData[i].price)
            minPrice = Math.min(minPrice, parsedData[i].price)
        }
       
        for (let i = currentIndex-maxVisiblePoints; i <= currentIndex; i++) {
            const x = (i - (currentIndex-maxVisiblePoints)) * stepX;
            const price = parsedData[i].price
            const y = app.renderer.height*0.9-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            if (i === currentIndex-maxVisiblePoints) {
                graph.moveTo(x, y);
            } else {
                graph.lineTo(x, y);
                if (i === currentIndex) {
                    priceLabel.y = Math.min(app.renderer.height*0.9, Math.max(textStyle.fontSize*2, 0.9*priceLabel.y + 0.1*y))
                    priceLabel.x = 0.9*priceLabel.x + 0.1*x
                    priceLabel.text = formatCurrency(price, 'USD', (price < 100) ? 2 : (((price >= 100 && price < 1000) || (price >= 100000 && price < 1000000)|| (price >= 10000000 && price < 100000000)) ? 0 : 1), true)
                    bitcoinLogo.x = x
                    bitcoinLogo.y = y 
                    bitcoinLogo.height = bitcoinLogo.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, yourCoins / 10.0)))
                }
            }

           
        }
        graph.stroke({ width: Math.max(app.renderer.height,app.renderer.width)*0.005, color: 0x00FF00 });

        trades.forEach((trade) => {
            trade.sprite.x =  (trade.index - (currentIndex-maxVisiblePoints)) * stepX;
            trade.sprite.y = app.renderer.height*0.9-  (trade.price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, trade.coins / 10.0)))
         })

        const currentDate = parsedData[currentIndex]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        stackLabel.text = (yourCoins > 0 && formatCurrency(yourCoins, 'BTC', 8) || '') + (yourFiat > 0 && formatCurrency(yourFiat, 'USD', yourFiat >= 1000 ? 0 : 2) || '')
    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');

})
