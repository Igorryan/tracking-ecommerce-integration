require("dotenv").config();
const { connectDb } = require("./src/models");

const cron = require('node-cron');
const microsservice = require('./src/app');

connectDb().then(async () => {
  console.log('Executando microsservice tracking (FLASH & AMEND)!');
  cron.schedule("0 */1 * * *", async () => {
    microsservice();
    console.log('Executando verificação de horário...');
  });
});



