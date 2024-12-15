const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
];

function getFormattedDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

async function downloadImage(fileName, url, date, retryCount = 3, retryDelay = 1000) {
  const filePath = path.resolve(__dirname, 'zdjecia', `${fileName}-${date}.jpg`);

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`Obrazek został zapisany do: ${filePath}`);
  } catch (error) {
    console.error(`Błąd podczas pobierania obrazka ${fileName}:`, error.message);

    if (retryCount > 0) {
      console.log(`Ponawianie próby za ${retryDelay / 1000} sekund... Pozostało prób: ${retryCount}`);
      setTimeout(() => {
        downloadImage(fileName, url, date, retryCount - 1, retryDelay);
      }, retryDelay);
    } else {
      console.error(`Nie udało się pobrać obrazka ${fileName} po kilku próbach.`);
    }
  }
}

const date = getFormattedDate();
urls.forEach(([fileName, url]) => {
  downloadImage(fileName, url, date);
});
