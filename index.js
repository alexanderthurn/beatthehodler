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
function findClosestDateIndex(array, targetDate) {
    const targetTime = targetDate.getTime(); // Zielzeit in Millisekunden

    return array.reduce((closestIndex, current, currentIndex, arr) => {
        const currentTime = current.snapped_at.getTime(); // Zeit des aktuellen Eintrags
        const closestTime = arr[closestIndex].snapped_at.getTime(); // Zeit des nächstgelegenen Eintrags

        // Prüfen, ob das aktuelle Datum näher am Ziel ist als das bisherige
        return Math.abs(currentTime - targetTime) < Math.abs(closestTime - targetTime)
            ? currentIndex
            : closestIndex;
    }, 0); // Start mit dem ersten Index (0)
}


function generateDatesBetween(startDate, endDate, n) {
    if (n < 2) {
        throw new Error('Die Anzahl der Einträge (n) muss mindestens 2 sein.');
    }

    const start = new Date(startDate).getTime(); // Startdatum als Timestamp
    const end = new Date(endDate).getTime(); // Enddatum als Timestamp

    const interval = (end - start) / (n - 1); // Zeitintervall zwischen den Datumswerten

    const dates = [];
    for (let i = 0; i < n; i++) {
        const currentTimestamp = start + i * interval;
        dates.push(new Date(currentTimestamp));
    }

    return dates;
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




    const buyPaused = 2000
    const maxVisiblePoints = 100; // Anzahl der sichtbaren Punkte im Graph

    let options = {
        fiatStart: 1000,
        dateStart: new Date(2011,0,1), // new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds);
        dateEnd: new Date(2020,3,3),
        stops: 7
    }

    if (typeof options.stops === 'number' && !isNaN(options.stops)) {
        options.stops = generateDatesBetween(options.dateStart, options.dateEnd, options.stops)
    }
    
    options.indexStart = Math.max(maxVisiblePoints, findClosestDateIndex(parsedData, options.dateStart))
    options.indexEnd = Math.max(maxVisiblePoints, findClosestDateIndex(parsedData, options.dateEnd))

   console.log(options)

    let yourCoins = 0
    let yourFiat = options.fiatStart
    let paused = Number.MAX_VALUE
    const trades = []
    
    addEventListener('pointerup', () => {
        let price = parsedData[currentIndexInteger].price
        let trade =  {
            index: currentIndexInteger, 
            price: price, 
            coins: yourCoins, 
            fiat: yourFiat,
            sprite: null,
            container: new PIXI.Container()
        }
       
        
        if (yourCoins > 0) {
            trade.sold = 'BTC'
            trade.bought = 'USD'
            trade.coins = yourCoins
            yourFiat = yourCoins * price
            yourCoins = 0
            trade.sprite = new PIXI.Graphics()
            trade.sprite.circle(0, 0, 50);
            trade.sprite.fill(0x00FF00, 1);

            const label = new PIXI.Text("$", textStyle);
            label.anchor.set(0.5,0.5)
            trade.container.addChild(trade.sprite)
            trade.container.addChild(label);
        } else {
            trade.sold = 'USD'
            trade.bought = 'BTC'
            trade.fiat = yourFiat
            yourCoins = yourFiat / price
            yourFiat = 0
            trade.sprite = new PIXI.Sprite(bitcoinSvg)
            trade.sprite.anchor.set(0.5,0.5)
            trade.container.addChild(trade.sprite)

        }


        trades.push(trade)
        app.stage.addChild(trade.container)
        paused = buyPaused
    })

    const gameDurationMilliseconds = 90000
    const factorMilliSeconds =  parsedData.length / gameDurationMilliseconds; // Intervall in Sekunden
    let currentIndexFloat = options.indexStart; // Zeitverfolgung
    let currentIndexInteger = Math.floor(currentIndexFloat)
   
    app.ticker.add((deltaTime) => {
        if (paused <= 0) {
            currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds;
        } else {
            paused -= deltaTime.elapsedMS
            if (paused < buyPaused) {
                currentIndexFloat += deltaTime.elapsedMS*factorMilliSeconds*(Math.max(0,(buyPaused-paused*2)/buyPaused));
            }
        }

        if (currentIndexFloat > options.indexEnd) {
            currentIndexFloat = options.indexEnd
        }

        currentIndexInteger = Math.floor(currentIndexFloat)




        let gradientWidth = app.renderer.width; 
        let gradientHeight = app.renderer.height; 
        let gradientFill = new PIXI.FillGradient(0, 0, 0, gradientHeight);
 
        if (yourCoins > 0) {       
         gradientFill.addColorStop(0, 0x000000);
         gradientFill.addColorStop(0.9 + Math.sin(currentIndexFloat*0.1)*0.05, 0x333333);
         gradientFill.addColorStop(1, 0xffa500);
        } else {
         gradientFill.addColorStop(0, 0x1E90FF);
         gradientFill.addColorStop(0.9 + Math.sin(currentIndexFloat*0.1)*0.05, 0x1E90FF);
         gradientFill.addColorStop(1, 0x32CD32);
        }
         graphic1.clear();
         graphic1.drawRect(0, app.renderer.height - gradientHeight,gradientWidth, gradientHeight).fill(gradientFill);
 
         
        

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = textStyle.fontSize*0.1
        textStyle.fontSize = Math.max(32, (Math.max(app.renderer.height, app.renderer.width) / 1080)*36)
        textStyle.stroke.width = textStyle.fontSize*0.2

        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width

        graph.clear();

        const stepX = app.renderer.width / maxVisiblePoints * 0.85;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndexInteger-maxVisiblePoints; i <= currentIndexInteger; i++) {
            maxPrice = Math.max(maxPrice, parsedData[i].price)
            minPrice = Math.min(minPrice, parsedData[i].price)
        }
       
        for (let i = currentIndexInteger-maxVisiblePoints; i <= currentIndexInteger; i++) {
            const x = (i - (currentIndexInteger-maxVisiblePoints)) * stepX;
            const price = parsedData[i].price
            const y = app.renderer.height*0.9-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            if (i === currentIndexInteger-maxVisiblePoints) {
                graph.moveTo(x, y);
            } else {
                graph.lineTo(x, y);
                if (i === currentIndexInteger) {
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
            trade.container.x =  (trade.index - (currentIndexInteger-maxVisiblePoints)) * stepX;
            trade.container.y = app.renderer.height*0.9-  (trade.price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            trade.sprite.height = trade.sprite.width = app.renderer.width*0.05//*(Math.max(0.1, Math.min(1, trade.coins / 10.0)))
         })

        const currentDate = parsedData[currentIndexInteger]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        stackLabel.text = (yourCoins > 0 && formatCurrency(yourCoins, 'BTC', 8) || '') + (yourFiat > 0 && formatCurrency(yourFiat, 'USD', yourFiat >= 1000 ? 0 : 2) || '')
    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');

})
