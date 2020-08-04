const fs = require('fs');
const VerifyHour = require('./functions/VerifyHour');
const DownloadCSV = require('./services/DownloadCSV');
const ImportCSV = require('./services/ImportCSV');
const getHawbs = require('./functions/getHawbs');
const SendMessageWhatsApp = require('./services/SendMessageWhatsApp');


async function App() {

  const timeToDownloadCSV = Number(process.env.TIME_TO_DOWNLOAD_CSV || 7);
  const timeToSendMessageInTheMorning = Number(process.env.TIME_TO_SEND_FIRST_MESSAGES || 9);
  const timeToSendMessageInTheAfternoon = Number(process.env.TIME_TO_SEND_SECOND_MESSAGES || 13);

  console.log(`Serviço iniciado às ${new Date()}\n`);
  let running = true;

  while (running) {
    try {
      if (VerifyHour(timeToSendMessageInTheMorning) || VerifyHour(timeToSendMessageInTheAfternoon)) {

        const fileName = await DownloadCSV();
        if (typeof fileName === 'string') {
          await ImportCSV(fileName);
          fs.unlink(`src/files/${fileName}`, () => {
            console.log(`CSV ${fileName} importado e removido do sistema de arquivos...`);
          });
        }
      }

      running = false;
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (err) {
      console.log(err);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

}

module.exports = App;