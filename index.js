// Funktion, um CSV-Daten in ein Array von Objekten zu konvertieren
function parseCSV(csvString) {
    const lines = csvString.split('\n'); // Aufteilen nach Zeilen
    const headers = lines[0].split(','); // Erste Zeile als Header verwenden

    // Restliche Zeilen in Objekte umwandeln
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : null;
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
    priceLabel.anchor.set(0.0,0.0)
    app.stage.addChild(priceLabel);


    let currentIndex = 0;
    const maxVisiblePoints = 100; // Anzahl der sichtbaren Punkte im Graph
    let elapsedTime = 0; // Zeitverfolgung
    const intervalInMilliSeconds = 100; // Intervall in Sekunden
    app.ticker.add((deltaTime) => {
        elapsedTime += deltaTime.elapsedMS;

        dateLabel.y = 0*textStyle.fontSize;
        dateLabel.x = 0*app.renderer.width
        textStyle.fontSize = (app.renderer.width / 1080)*36

        graph.clear();
        graph.setStrokeStyle(2, 0xff0000, 1);

        let startX = 0;
        const stepX = app.renderer.width / maxVisiblePoints * 0.9;
        let maxPrice = 0
        let minPrice = Number.MAX_VALUE
        for (let i = currentIndex; i < Math.min(currentIndex + maxVisiblePoints, parsedData.length); i++) {
            maxPrice = Math.max(maxPrice, parseFloat(parsedData[i].price))
            minPrice = Math.min(minPrice, parseFloat(parsedData[i].price))
        }
        console.log(minPrice, maxPrice)
        for (let i = currentIndex; i < Math.min(currentIndex + maxVisiblePoints, parsedData.length); i++) {
            const x = startX + (i - currentIndex) * stepX;
            const price = (parseFloat(parsedData[i].price) || 0)
            const y = app.renderer.height-  (price-minPrice)/(maxPrice-minPrice)*app.renderer.height*0.8;
            if (i === currentIndex) {
                graph.moveTo(x, y);
            } else {
                graph.lineTo(x, y);
                if (i === Math.min(currentIndex + maxVisiblePoints, parsedData.length)-1) {
                    priceLabel.y = y
                    priceLabel.x = x
                    priceLabel.text = Math.floor(price) + "$"
                }
            }
        }
        graph.stroke({ width: 1, color: 0x00FF00 });
        //console.log(graph)

        const currentDate = parsedData[currentIndex]?.snapped_at;
        if (currentDate) {
            dateLabel.text = `${new Date(currentDate).toLocaleDateString()}`;
        }

        

        if (elapsedTime >= intervalInMilliSeconds) {
            currentIndex = (currentIndex + 1) % parsedData.length; // Nächster Tag

            elapsedTime = 0; // Timer zurücksetzen
        }
    });
}

window.addEventListener("load", (event) => {
    drawGraph('btc-usd-max.csv');

})
