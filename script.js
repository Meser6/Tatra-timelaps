const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');


const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE ? JSON.parse(process.env.GOOGLE) : 'google.json',
  scopes: 'https://www.googleapis.com/auth/drive',
});
async function uploadFile(fileName, filePath, driveDir) {
  try {
    const driveService = google.drive({ version: 'v3', auth });

    const response = await driveService.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'image/jpeg',
       parents: [driveDir], 

      },
      media: {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath),
      },
    });
    console.log(`Plik ${fileName} został przesłany. ID pliku: ${response.data.id}`);
  } catch (error) {
    console.error('Błąd podczas przesyłania pliku:', error.message);
  }
}

const urls = [
  {fileName:'moko01', url: 'http://kamery.topr.pl/moko/moko_01.jpg', dir: '1yF-HyK2OwY6obr_y-vN2H6OmTj-2CpUe'},
  {fileName: 'moko02', url:'http://kamery.topr.pl/moko_TPN/moko_02.jpg', dir:'1EXbt0tZhjbyzk9KKNVM6SuB9tvPOUhD7'},
  {fileName:'piatka01', url:'http://kamery.topr.pl/stawy2/stawy2.jpg', dir:'1ID36YoADjYtfMGF9GMSX_KDlPr_qXbmz'},
  {fileName:'piatka02', url:'http://kamery.topr.pl/stawy1/stawy1.jpg', dir:'1b7zFZs_coA9IxsueQMHUePk4mZ3C__tn'},
  {fileName:'gasienicowa', url:'http://kamery.topr.pl/hala/hala.jpg', dir: '1JBXnzseFJvj-yXLkIeDYJxJ2Cv1FPM4O'},
  {fileName:'kaspro', url:'http://kamery.topr.pl/goryczkowa/gorycz.jpg', dir:'1DLCpsdpS5hAOCbjC075nLlXSt1RzwsA-'},
  {fileName:'koscielisko', url:'http://kamery.topr.pl/czwierchy/czwierchy.jpg', dir:'1veFgo6LD5Er-UOoJvRZzMKGqATkLpiDM'},
  {fileName:'chocholowska01', url:'http://kamery.topr.pl/chocholowska/chocholow.jpg', dir:'1UCCyQ8K1PP6xccsUewEvOZPgD8Y7u8n6'},
  {fileName:'chocholowska02', url:'http://kamery.topr.pl/chocholowska2/chochol2.JPG', dir:'1vbIY3PWaN_NOR-oE8S2-MBH-xWQqB9lC'},
];

function getFormattedDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}

async function downloadAndUploadImage(option, date, retryCount = 3, retryDelay = 1000) {
  const filePath = path.resolve(__dirname, 'photo', `${option.fileName}-${date}.jpg`);

  try {
    const response = await axios.get(option.url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`Obrazek został zapisany do: ${filePath}`);
    uploadFile(`${option.fileName}-${date}.jpg`, filePath, option.dir);
  } catch (error) {
    console.error(`Błąd podczas pobierania obrazka ${option.fileName}:`, error.message);

    if (retryCount > 0) {
      console.log(`Ponawianie próby za ${retryDelay / 1000} sekund... Pozostało prób: ${retryCount}`);
      setTimeout(() => {
        downloadImage(option, date, retryCount - 1, retryDelay);
      }, retryDelay);
    } else {
      console.error(`Nie udało się pobrać obrazka ${fileName} po kilku próbach.`);
    }
  }
}

const date = getFormattedDate();
urls.forEach(( e ) => {
  downloadAndUploadImage(e, date);
});
