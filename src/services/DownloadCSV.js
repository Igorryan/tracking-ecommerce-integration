const PromiseFtp = require('promise-ftp');
const fs = require('fs');
const config = require('../config/ftpConfig.js');
const isToday = require('../functions/isToday');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

async function DownloadCSV() {

  try {
    const ftp = new PromiseFtp();

    await ftp.connect(config);

    const files = await ftp.list('/Retorno_Diario');

    if (!files) {
      const erro = 'Nenhum arquivo encontrado no servidor FTP';
      await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
      await sendMessageAPIWhatsApp('31989551995', erro);
      console.log(erro);
      return false;
    }

    const fileToday = await files.find(file => isToday(file.date));

    if (!fileToday) {
      const erro = 'O arquivo de hoje não está disponível';
      await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
      await sendMessageAPIWhatsApp('31989551995', erro);
      console.log(erro);
      return false;
    }

    await ftp.end();

    await ftp.connect(config)
      .then(function (serverMessage) {
        return ftp.get(`/Retorno_Diario/${fileToday.name}`);
      }).then(function (stream) {
        return new Promise(function (resolve, reject) {
          stream.once('close', resolve);
          stream.once('error', reject);
          stream.pipe(fs.createWriteStream(`src/files/${fileToday.name}`));
        });
      }).then(function () {
        return ftp.end();
      });

    console.log('✔ Download CSV;');

    return fileToday.name;
  } catch (err) {
    const erro = 'Erro ao tentar realizar o Download do CSV';
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    await sendMessageAPIWhatsApp('31989551995', erro);
    console.log(erro);
    return false;
  }


}

module.exports = DownloadCSV;