//Arquivo importa o CSV do FTP da FLASH e salva no banco REDIS
const SendMessageWhatsApp = require('./SendMessageWhatsApp');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const getHawbs = require('../functions/getHawbs');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

async function ImportCSV(fileName) {

  const hawbs = [];

  let countLinesCsv = 0;

  return await new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve('src', 'files', `${fileName}`))
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
        console.log(`Pedidos recuperados: ${hawbs.length}`);

        if (!hawbs) {
          const erro = 'Nenhum hawb lido no CSV';
          console.warn(erro)
          return false;
        }

        const pedidos = await getHawbs(hawbs);
        resolve(pedidos)
        })
      .on('error', reject);
  }).then(async (pedidos) => {

    if(!pedidos){
      return false;
    }
    
    await SendMessageWhatsApp(pedidos);
    return true;
  }).catch(async (error) => {
    const erro = 'Erro ao tentar importar CSV';
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    await sendMessageAPIWhatsApp('31989551995', erro);
    console.warn(erro);
    return false;
  })
}

module.exports = ImportCSV;
