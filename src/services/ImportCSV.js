//Arquivo importa o CSV do FTP da FLASH e salva no banco REDIS
const SendMessageWhatsApp = require('./SendMessageWhatsApp');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const getHawbs = require('../functions/getHawbs');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

async function ImportCSV(fileName) {
  try {

    const hawbs = [];

    let countLinesCsv = 0;

    await fs.createReadStream(path.resolve('src', 'files', `${fileName}`))
      .pipe(csv())
      .on('data', (row) => {
        const linha = JSON.stringify(row);
        const splitMaster = linha.split(';');
        const [, hawb] = splitMaster[7].split(':"');
        const [numAr,] = splitMaster[8].split(' ');
        const name = splitMaster[11].trim();
        const [telefone,] = splitMaster[14].split('"}');
        const phone = telefone.replace(' ', '');

        hawbs.push({
          hawb,
          numAr,
          name,
          phone
        });

        countLinesCsv++;
      })
      .on('end', async () => {
        console.log(`Linhas lidas no CSV: ${countLinesCsv}`)
        console.log('✔ Hawbs salvos');
        console.log(`Pedidos recuperados: ${hawbs.length}`);

        if (!hawbs) {
          throw new Error('Nenhum hawb lido no CSV');
        }

        const pedidos = await getHawbs(hawbs);

        pedidos && await SendMessageWhatsApp(pedidos);
      });
  } catch (err) {
    const erro = 'Erro ao tentar importar CSV';
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    throw new Error(erro);
  }
}

module.exports = ImportCSV;
