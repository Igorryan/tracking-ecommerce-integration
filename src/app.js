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

  let running = true;

  while (running) {
    if (VerifyHour(timeToSendMessageInTheMorning) || VerifyHour(timeToSendMessageInTheAfternoon)) {

      const fileName = await DownloadCSV();
      if (typeof fileName === 'string') {
        const done = await ImportCSV(fileName)
        if (done) {
          running = false;
          fs.unlink(`src/files/${fileName}`, () => {
            console.log(`CSV ${fileName} importado e removido do sistema de arquivos..`);
            console.log('Processo de envio de mensagem finalizado!');
          });
        } else {
          console.log('Não foi possível finalizar o processo, tentando novamente...')
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } else {
      console.log('Horário não alocado para envio de mensagens. ')
      running = false;
    }
  }
}

module.exports = App;