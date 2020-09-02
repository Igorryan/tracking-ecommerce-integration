const axios = require('axios');
const flashConfig = require('../config/flashConfig');
const sendMessageAPIWhatsApp = require('../api/SendMessageAPIWhatsApp');

class FlashAPI {
  constructor() {
  }

  async getToken() {
    try {
      const { key, login, senha, urlToken } = flashConfig;

      var headersOpt = {
        "content-type": "application/json",
        "Authorization": key
      };

      const { data } = await axios.post(urlToken, {
        "login": login,
        "senha": senha
      }, { headers: headersOpt });

      return data.access_token;
    } catch (err) {
      const erro = 'Erro ao tentar pegar token na API da Flash';
      await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
      console.log(erro);
      return false;
    }
  }

  async getOrders(token, numArs) {

    try {
      const { urlConsulta, clienteId, cttId } = flashConfig;

      var headersOpt = {
        "content-type": "application/json",
        "Authorization": token
      };

      const { data } = await axios.post(urlConsulta, {
        "clienteId": clienteId,
        "cttId": cttId,
        "numEncCli": numArs
      }, { headers: headersOpt });

      return data;
    } catch (err) {
      const erro = 'Erro ao tentar capturar pedido na API da Flash';
      await sendMessageAPIWhatsApp(process.env.NUM_FOR_LOGS, erro);
      console.log(erro);
      return false;
    }
  }
}

module.exports = FlashAPI;