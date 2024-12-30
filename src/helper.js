function hexToRGB(hex, a) {
    // Entfernt das # falls vorhanden
    hex = hex.replace(/^#/, '');
    
    // Konvertiert die Hex-Werte zu Dezimal
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    return [r, g, b, a];
}


function formatCurrencyInner(value, currency, locale, fractionDigits) {
    try {
        // Versuche direkt, mit der angegebenen Währung zu formatieren
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(value);
    } catch {
        // Fallback: Ersetze durch USD und tausche später das Symbol aus
        const formatted = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(value);
        // Tausche das USD-Symbol durch den Währungscode
        return formatted.replace('$', currency);
    }
}

function formatCurrencyInnerToParts(value, currency, locale) {
    try {
        // Versuche direkt, die Formatteile mit der gewünschten Währung zu erzeugen
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
        }).formatToParts(value);
    } catch {
        // Fallback: Erzeuge die Teile mit USD und ersetze das Symbol
        const parts = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD',
        }).formatToParts(value);

        // Ersetze das Symbol durch den Währungscode
        return parts.map(part =>
            part.type === 'currency' ? { ...part, value: currency } : part
        );
    }
}

function formatCurrency(price, currency, fractionDigits, abbreviate = false) {
    const locale = 'de-DE' // navigator.language;

    if (abbreviate) {
        if (price < 0.001) {
            fractionDigits = 8
        } else if (price < 0.01) {
            fractionDigits = 6
        } else if (price < 0.1) {
            fractionDigits = 4
        } else if (price < 1) {
            fractionDigits = 2
        } else if (price < 100) {
            fractionDigits = 2
        } else if (price < 1000) {
            fractionDigits = 0
        } else {
            fractionDigits = 1
        }
      }


   

    let formatted;

    if (abbreviate) {
        const suffixes = ['', 'K', 'M', 'B', 'T']; // Tausend, Million, Milliarde, Billion
        let tier = Math.floor(Math.log10(Math.abs(price)) / 3); // Bestimmen des Tiers
        tier = Math.min(tier, suffixes.length - 1); // Begrenzen auf verfügbare Suffixe
       

        // Abkürzung erst ab zwei Stellen verwenden
        if (tier >= 1) { // Abkürzen ab Tausender (1 oder mehr Stellen im Tier)
            formatted = formatCurrencyInner(price / Math.pow(10, tier * 3), currency, locale, fractionDigits)
        
            const parts = formatCurrencyInnerToParts(1, currency, locale)

            const symbolIndex = parts.findIndex(part => part.type === 'currency');
            // Suffix hinzufügen
            if (symbolIndex < 1) {
                formatted += suffixes[tier];
            } else {
                if (parts[symbolIndex-1].type === 'literal') {
                    formatted = formatted.replace(parts[symbolIndex].value, suffixes[tier] + parts[symbolIndex].value).replace(parts[symbolIndex-1].value + suffixes[tier], suffixes[tier] + parts[symbolIndex-1].value)
                } else {
                    formatted = formatted.replace(parts[symbolIndex].value, suffixes[tier] + parts[symbolIndex].value)
                }
             }
            
        } else {
            formatted = formatCurrencyInner(price, currency, locale, fractionDigits)
        }
    } else if (price === null) {
        const parts = formatCurrencyInnerToParts(1, currency, locale)
        const symbolIndex = parts.findIndex(part => part.type === 'currency');
        formatted = parts[symbolIndex].value
    } else {
        formatted = formatCurrencyInner(price, currency, locale, fractionDigits)
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
        const currentTime = current.date.getTime(); // Zeit des aktuellen Eintrags
        const closestTime = arr[closestIndex].date.getTime(); // Zeit des nächstgelegenen Eintrags

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

function parseDate(dateString) {
    // ISO-Format sicherstellen
    return new Date(dateString.replace(" ", "T").replace(" UTC", "Z"));
}
function parseCSV(csvString) {
    const lines = csvString.split('\n'); // Aufteilen nach Zeilen
    const headers = lines[0].split(',').map(h => h.trim()); // Erste Zeile als Header verwenden

    // Restliche Zeilen in Objekte umwandeln
    const data = lines.slice(1).filter(line => line?.length > 0).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            const value = values[index] ? values[index].trim() : null;

            // Mapping der Header zu gewünschten Schlüsseln
            if (header === 'snapped_at') {
                obj['date'] = parseDate(value);
            } else if (header === 'price') {
                obj['price'] = parseFloat(value);
            }

            return obj;
        }, {});
    });

    return data;
}


async function fetchData(coins) {
    const results = await Promise.all(Object.keys(coins).map(async (name) => {
        if (coins[name].csv) {
            coins[name].data = await fetchCSV(coins[name].csv);
        }
    }));

    await alignData(coins)
}
async function alignData(coins) {
    // Schritt 1: Finde alle Coins mit Daten
    let dataCoinNames = Object.keys(coins).filter(name => coins[name].data);

    // Schritt 2: Bestimme das früheste und späteste Datum
    let minDate = coins[dataCoinNames[0]].data[0].date; // .date ist bereits ein Date-Objekt
    let maxDate = coins[dataCoinNames[0]].data[coins[dataCoinNames[0]].data.length - 1].date;

    dataCoinNames.forEach(name => {
        let c = coins[name];
        let coinMinDate = c.data[0].date; // .date ist ein Date-Objekt
        let coinMaxDate = c.data[c.data.length - 1].date;

        if (coinMinDate < minDate) {
            minDate = coinMinDate;
        }

        if (coinMaxDate > maxDate) {
            maxDate = coinMaxDate;
        }
    });

    // Schritt 3: Generiere den kompletten Datumsbereich (tagesweise)
    let dateRange = [];
    let currentDate = new Date(minDate); // Kopiere minDate
    while (currentDate <= maxDate) {
        dateRange.push(new Date(currentDate)); // Speichere das Date-Objekt
        currentDate.setDate(currentDate.getDate() + 1); // Nächster Tag
    }

    // Schritt 4: Daten für jeden Coin anpassen
    dataCoinNames.forEach(name => {
        let c = coins[name];
        let dataMap = new Map(c.data.map(entry => [entry.date.toISOString().split('T')[0], entry.price])); // Nutze .date direkt
        let alignedData = dateRange.map(date => ({
            date: date, // Behalte das Date-Objekt
            price: dataMap.get(date.toISOString().split('T')[0]) || null, // Fehlende Daten auffüllen mit null
        }));
        c.data = alignedData; // Ersetze die Daten mit den ausgerichteten Daten
    });

    return coins; // Optional: aktualisierte Coins zurückgeben
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

function calculateLevelStatistics(level, coins) {

    let dataCoinNames = level.coinNames.filter(name => coins[name].data);
    
    let fiatBest = level.fiatStart
    let fiatWorst = level.fiatStart
    for (let i=1;i<level.stopIndizes.length;i++) {

        let bestFactor = 1
        let worstFactor = 1
        dataCoinNames.forEach(name => {
            let pricesData = coins[dataCoinNames[0]].data
            
            let price1 = pricesData[level.stopIndizes[i]].price 
            let price2 = pricesData[level.stopIndizes[i-1]].price

            if (price1 === null || price2 === null) {
                return
            }

            let factor = price1/ price2
            if (factor > bestFactor) {
                bestFactor = factor
            }

            if (factor < worstFactor) {
                worstFactor = factor
            }


        })

      
        if (bestFactor > 1.0) {
            fiatBest*=bestFactor  
        }
        
        if (worstFactor < 1.0) {
            fiatWorst*=worstFactor
        }
    }

    level.fiatBest = fiatBest
    level.fiatWorst = fiatWorst
}


// Funktion, um CSV-Daten in ein Array von Objekten zu konvertieren
function parseGameData(jsonString, coins) {
    var gameData = JSON.parse(jsonString) 
    
    
    gameData.levels.forEach(level => {
        level.coinNames = Object.keys(coins).filter(name => name === 'BTC' || name === 'ADA'  || name === 'USD')
        //level.coinNames = Object.keys(coins)
        let dataCoinNames = level.coinNames.filter(name => coins[name].data);
        let pricesData = coins[dataCoinNames[0]].data

        level.fiatStart = level.fiatStart || 1000
        level.dateStart = level.dateStart && parseDate(level.dateStart) || pricesData[0].date
        level.dateEnd = level.dateEnd && parseDate(level.dateEnd) || pricesData[pricesData.length-1].date
        level.stops = level.stops || 8
        level.dateStart = pricesData[findClosestDateIndex(pricesData, level.dateStart)].date
        level.dateEnd = pricesData[findClosestDateIndex(pricesData, level.dateEnd)].date
        level.indexStart = Math.max(0, findClosestDateIndex(pricesData, level.dateStart))
        level.indexEnd = Math.max(0, findClosestDateIndex(pricesData, level.dateEnd))
        if (typeof level.stops === 'number' && !isNaN(level.stops)) {
            level.stops = generateDatesBetween(level.dateStart, level.dateEnd, level.stops)
        } else if (Array.isArray(level.stops)) {
            level.stops = level.stops.map(d => typeof d === 'string' && parseDate(d))
        }
        level.stopIndizes = level.stops.map(d => findClosestDateIndex(pricesData, d))
        calculateLevelStatistics(level, coins)
    })
   
    return gameData;
}

async function fetchGameData(coins) {
    try {
        const response = await fetch('./data/game.json');
        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Datei: ${response.statusText}`);
        }
        const jsonString = await response.text();
        return parseGameData(jsonString, coins);
    } catch (error) {
        console.error("Fehler beim Laden der JSON Game-Datei:", error);
        return {};
    }
}
     /* DO NOOT DELETE !!!!!
        priceLabel.x = app.renderer.width*1
        priceLabel.y = app.renderer.height*0.8
        priceLabel.text = formatCurrency(0.00021, fiatName,null, true) + '\n' + formatCurrency(0.0021, fiatName,null, true) + '\n' + formatCurrency(0.021, fiatName,null, true) + '\n' +  formatCurrency(0.21, fiatName,null, true) + '\n' + formatCurrency(2.21, fiatName,null, true) + '\n' + formatCurrency(21.21, fiatName,null, true) + '\n' + formatCurrency(212.21, fiatName,null, true) + '\n' + formatCurrency(2121.21, fiatName,null, true) + '\n' + formatCurrency(21212.21, fiatName,null, true) + '\n' + formatCurrency(221212.21, fiatName,null, true) + '\n' + formatCurrency(2212121.21, fiatName,null, true) + '\n' + formatCurrency(22121212.21, fiatName,null, true)  + '\n' + formatCurrency(221212121.21, fiatName,null, true) + '\n' + formatCurrency(2212121221.21, fiatName,null, true) 
        */
