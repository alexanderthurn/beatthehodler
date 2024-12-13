function formatCurrency(amount, currency, fractionDigits) {

    const locale = navigator.language;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount);

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
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);

    const graph = new PIXI.Graphics();
    app.stage.addChild(graph);

    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        stroke: { color: '#fff', width: 5, join: 'round' },
        dropShadow: {
            color: '#000',
            blur: 4,
            angle: Math.PI / 6,
            distance: 6,
        },
        wordWrap: true,
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
    const maxVisiblePoints = 100; // Anzahl der sichtbaren Punkte im Graph

    addEventListener('pointerup', () => {
        let price = parsedData[currentIndex].price
        if (yourCoins > 0) {
            yourFiat = yourCoins * price
            yourCoins = 0
        } else {
            yourCoins = yourFiat / price
            yourFiat = 0
        }
        paused = 1000
    })




    let currentIndex = 0 + parsedData.length-500 +maxVisiblePoints
    let elapsedTime = 0; // Zeitverfolgung
    const intervalInMilliSeconds = 1; // Intervall in Sekunden
    

    app.ticker.add((deltaTime) => {

        if (paused <= 0) {
            elapsedTime += deltaTime.elapsedMS;
        } else {
            paused -= deltaTime.elapsedMS
        }
       

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = 0*app.renderer.width
        textStyle.fontSize = Math.max(32, (Math.max(app.renderer.height, app.renderer.width) / 1080)*36)

        stackLabel.y = app.renderer.height;
        stackLabel.x = 0.5*app.renderer.width

        graph.clear();
        graph.setStrokeStyle(2, 0xff0000, 1);

        let startX = 0;
        const stepX = app.renderer.width / maxVisiblePoints * 0.85;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndex-maxVisiblePoints; i <= currentIndex; i++) {
            maxPrice = Math.max(maxPrice, parsedData[i].price)
            minPrice = Math.min(minPrice, parsedData[i].price)
        }
       
        for (let i = currentIndex-maxVisiblePoints; i <= currentIndex; i++) {
            const x = startX + (i - (currentIndex-maxVisiblePoints)) * stepX;
            const price = parsedData[i].price
            const y = app.renderer.height*0.9-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            if (i === currentIndex-maxVisiblePoints) {
                graph.moveTo(x, y);
            } else {
                graph.lineTo(x, y);
                if (i === currentIndex) {
                    priceLabel.y = y
                    priceLabel.x = x
                    priceLabel.text = formatCurrency(Math.floor(price), 'USD', 0)
                    bitcoinLogo.x = x
                    bitcoinLogo.y = y 
                    bitcoinLogo.height = bitcoinLogo.width = app.renderer.width*0.05
                }
            }
        }
        graph.stroke({ width: 1, color: 0x00FF00 });

        const currentDate = parsedData[currentIndex]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        stackLabel.text = (yourCoins > 0 && formatCurrency(yourCoins, 'BTC', 2) || '') + (yourFiat > 0 && formatCurrency(yourFiat, 'USD', 2) || '')
        
        if (elapsedTime >= intervalInMilliSeconds) {
            currentIndex = (currentIndex + 1) 
            if (currentIndex > parsedData.length-1) {
                currentIndex = parsedData.length -1
            } 
            elapsedTime = 0; // Timer zurücksetzen
        }
    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');

})
