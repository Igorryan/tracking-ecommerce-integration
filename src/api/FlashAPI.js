const axios = require('axios');
const flashConfig = require('../config/flashConfig');

class FlashAPI {
  constructor() {
  }

  async getToken() {
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
  }

  async getOrders(token, numArs) {

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
  }
}

module.exports = FlashAPI;