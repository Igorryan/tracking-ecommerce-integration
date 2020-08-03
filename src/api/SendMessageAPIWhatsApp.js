const axios = require('axios')
const messageWhatsAppConfig = require('../config/messageWhatsApp');

async function sendMessageAPIWhatsApp(phone, message){

  const url = `${messageWhatsAppConfig.url}/sendMessage?token=${messageWhatsAppConfig.token}`

  await axios.post(url, { 
    "phone": `55${phone}`, 
    "body": message 
  })
}

module.exports = sendMessageAPIWhatsApp;