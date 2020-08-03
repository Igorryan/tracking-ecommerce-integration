const PromiseFtp = require('promise-ftp');
const fs = require('fs');
const config = require('../config/ftpConfig.js');
const isToday = require('../functions/isToday');

async function DownloadCSV() {

  try {
    const ftp = new PromiseFtp();

    await ftp.connect(config);

    const files = await ftp.list('/Retorno_Diario');

    if (!files) {
      throw new Error('Nenhum arquivo encontrado no servidor FTP');
    }

    const fileToday = await files.find(file => isToday(file.date));

    if (!fileToday) {
      throw new Error('O arquivo de hoje não está disponível');
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
    throw new Error(err);
  }


}

module.exports = DownloadCSV;