const axios = require('axios');
const flashConfig = require('../config/flashConfig');

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
      throw new Error('Erro ao tentar pegar token na API da Flash');
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
      throw new Error('Erro ao tentar capturar pedido na API da Flash');
    }
  }
}

module.exports = FlashAPI;