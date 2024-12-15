const axios = require('axios');
const fs = require('fs');

const urls = [
  ['moko01', 'http://kamery.topr.pl/moko/moko_01.jpg'],
  ['moko02', 'http://kamery.topr.pl/moko_TPN/moko_02.jpg'],
  ['piatka01', 'http://kamery.topr.pl/stawy2/stawy2.jpg'],
  ['piatka02', 'http://kamery.topr.pl/stawy1/stawy1.jpg'],
  ['gasienicowa', 'http://kamery.topr.pl/hala/hala.jpg'],
  ['kaspro', 'http://kamery.topr.pl/goryczkowa/gorycz.jpg'],
  ['koscielosko', 'http://kamery.topr.pl/czwierchy/czwierchy.jpg'],
  ['chocholowska01', 'http://kamery.topr.pl/chocholowska/chocholow.jpg'],
  ['chocholowska02', 'http://kamery.topr.pl/chocholowska2/chochol2.JPG'],
  ['czarnaGora', 'http://kamery.topr.pl/cg/cg.jpg'],
]
function getFormattedDate() {
  const today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1; 
  const year = today.getFullYear();

  if (day < 10) {
      day = '0' + day;
  }
  if (month < 10) {
      month = '0' + month;
  }

  return `${day}-${month}-${year}`;
}

async function downloadImage(fileName, url, date) {
    try {
      const filePath = `./zdjecia/${fileName}-${date}.jpg`;

        const response = await axios.get(url, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);

        // Zapisz strumień odpowiedzi do pliku
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log('Obrazek został zapisany do:', filePath);
        });

        writer.on('error', (err) => {
            console.log('Błąd podczas zapisu obrazka:', err);
            console.log('Proba druga:');
            downloadImage(fileName, url, date);
        });
    } catch (error) {
        console.error('Błąd podczas pobierania obrazka:', error);
    }
}

urls.forEach(([fileName, url]) => {
  downloadImage(fileName, url, getFormattedDate());
})
