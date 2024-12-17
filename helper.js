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
