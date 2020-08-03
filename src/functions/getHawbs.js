const separarArray = require('./separarArray');
const FlashAPI = require('../api/FlashAPI');

async function getHawbs(PedidosDoCSV) {

  const flashAPI = new FlashAPI();
  const token = await flashAPI.getToken();
  const HawbsAPI = [];
  const quantidadeDeARsACadaConsulta = 400;

  if (!token) {
    throw new Error('Aplicação não conseguiu pegar o Token na API da Flash');
  }

  if (!PedidosDoCSV) {
    throw new Error('Não foi encontrado nenhum registro de pedidos no Redis para hoje');
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
      throw new Error(`Nenhum hawb foi encontrado no ${i}° array`);
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