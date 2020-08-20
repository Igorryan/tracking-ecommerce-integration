const separarArray = require('./separarArray');
const FlashAPI = require('../api/FlashAPI');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

async function getHawbs(PedidosDoCSV) {

  const flashAPI = new FlashAPI();
  const token = await flashAPI.getToken();
  const HawbsAPI = [];
  const quantidadeDeARsACadaConsulta = 400;

  if (!token) {
    const erro = "Aplicação não conseguiu pegar o Token na API da Flash"
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    await sendMessageAPIWhatsApp('31989551995', erro);
    console.warn(erro);
    return false;
  }

  if (!PedidosDoCSV) {
    const erro = "Não foi encontrado nenhum registro de pedidos para hoje"
    await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
    await sendMessageAPIWhatsApp('31989551995', erro);
    console.warn(erro);
    return false;
  }

  //Separando em arrays de no maximo 500 posições
  const ArraysDePedidos = separarArray(PedidosDoCSV, quantidadeDeARsACadaConsulta);

  //Consultado arrays e armazenando pedidos da API
  for (let i = 0; i < ArraysDePedidos.length; i++) {

    const pedidos = ArraysDePedidos[i].map(pedido => {
      return pedido.numAr;
    });

    const { hawbs } = await flashAPI.getOrders(token, pedidos);


    if (!hawbs) {
      const erro = `Nenhum hawb foi encontrado no ${i}° array`;
      console.warn(erro);
      return false;
    }

    hawbs && hawbs.forEach(h => {
      HawbsAPI.push(h);
    });
  }

  //Concatenando array de Hawbs recebido da Flash com Array de dados importado do CSV
  const Pedidos = [];

  HawbsAPI.filter(hawb => {
    const respectiveHawbInCsv = PedidosDoCSV.find(hawbCSV => hawb.hawbId === hawbCSV.hawb);

    if (respectiveHawbInCsv && hawb) {
      const hawbCsvAndHawbAPI = {
        csv: respectiveHawbInCsv,
        api: hawb,
      };

      Pedidos.push(hawbCsvAndHawbAPI);
    }
  });

  return Pedidos;

}

module.exports = getHawbs;